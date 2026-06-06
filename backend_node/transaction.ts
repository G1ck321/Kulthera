import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto'; // 💥 FIXED: Missing crypto import added!

// Force environmental initialization first
dotenv.config(); 

import { createAuthenticatedClient, isPendingGrant } from '@interledger/open-payments';
import { setRedirectUrl } from './bridge.js'; 

// Global state bridge for coordinating single-session human interaction loop
export const stateBridge = {
  interactRef: null as string | null,
  error: null as string | null
};

let client: any = undefined;

function normalizeWalletUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('$')) {
    return `https://${trimmed.slice(1)}`;
  }
  return trimmed;
}

export async function run() {
  stateBridge.error = null;

  try {
    const rawSenderWalletUrl = process.env.SENDER_WALLET_URL;
    const senderKeyId = process.env.SENDER_KEY_ID;
    const rawReceiverWalletUrl = process.env.RECEIVER_WALLET_URL;

    if (!rawSenderWalletUrl || !senderKeyId || !rawReceiverWalletUrl) {
      throw new Error(`❌ Missing environment configuration keys!`);
    }

    // 🛑 CRITICAL CHECK: Enforce strict URL format for Key ID
    if (!senderKeyId.startsWith('http')) {
      throw new Error(`❌ SENDER_KEY_ID must be a full URL (e.g. https://ilp.../jwks/123), not just a UUID! You have: ${senderKeyId}`);
    }

    const senderWalletUrl = normalizeWalletUrl(rawSenderWalletUrl);
    const receiverWalletUrl = normalizeWalletUrl(rawReceiverWalletUrl);

    const senderPrivateKeyPath = process.env.RENDER
      ? '/etc/secrets/private-key.pem' 
      : path.resolve(process.cwd(), process.env.SENDER_PRIVATE_KEY_PATH || 'private-key.pem');

    if (!fs.existsSync(senderPrivateKeyPath)) {
      throw new Error(`❌ Cannot find private key at path: ${senderPrivateKeyPath}`);
    }

    const privateKey = fs.readFileSync(senderPrivateKeyPath, 'utf-8').trim();

    console.log(`🌐 Connecting Open Payments client identity to: ${senderWalletUrl}`);

    if (!client) {
      client = await createAuthenticatedClient({
        walletAddressUrl: senderWalletUrl,
        privateKey: privateKey,
        keyId: senderKeyId,
        validateResponses: false 
      });
    }

    const profileClient = client.walletAddress || client.paymentPointer;
    if (!profileClient) throw new Error("❌ SDK Error: Could not bind wallet identity.");

    console.log("➡️ Step 1: Discovering target wallet profiles...");
    const senderWallet = await profileClient.get({ url: senderWalletUrl });
    const receiverWallet = await profileClient.get({ url: receiverWalletUrl });

    console.log("➡️ Step 2: Requesting Incoming Payment Grant...");
    const incomingPaymentGrant = await client.grant.request(
      { url: receiverWallet.authServer },
      {
        access_token: {
          access: [{ type: 'incoming-payment', actions: ['create', 'read'] }],
        },
      }
    );

    if (isPendingGrant(incomingPaymentGrant)) throw new Error('Incoming payment credentials pending.');

    console.log("➡️ Step 3: Creating Incoming Payment on testnet...");
    const incomingPayment = await client.incomingPayment.create(
      { url: receiverWallet.resourceServer, accessToken: incomingPaymentGrant.access_token.value },
      {
        walletAddress: receiverWalletUrl,
        incomingAmount: { 
          value: '500', 
          assetCode: receiverWallet.assetCode,
          assetScale: receiverWallet.assetScale
        },
      }
    );

    console.log("➡️ Step 4: Requesting Quote Grant...");
    const quoteGrant = await client.grant.request(
      { url: senderWallet.authServer },
      {
        access_token: {
          access: [{ type: 'quote', actions: ['create', 'read'] }],
        },
      }
    );

    if (isPendingGrant(quoteGrant)) throw new Error('Quote credentials pending.');

    console.log("➡️ Step 5: Creating the Transaction Quote...");
    const quote = await client.quote.create(
      { url: senderWallet.resourceServer, accessToken: quoteGrant.access_token.value },
      {
        walletAddress: senderWalletUrl,
        receiver: incomingPayment.id,
        method: 'ilp' 
      }
    );

    console.log("➡️ Step 6: Requesting Interactive Outgoing Grant...");
    const outgoingPaymentGrant = await client.grant.request(
      { url: senderWallet.authServer },
      {
        access_token: {
          access: [
            {
              type: 'outgoing-payment',
              actions: ['create', 'read', 'list'],
              limits: {
                debitAmount: quote.debitAmount,
              },
            },
          ],
        },
        interact: {
          start: ['redirect'],
          finish: {
            method: 'redirect',
            uri: process.env.FRONTEND_URL || 'http://localhost:5173/paycheck',
            nonce: crypto.randomUUID(),
          },
        },
      }
    );

    let finalAccessToken: string;

    if (isPendingGrant(outgoingPaymentGrant)) {
      console.log('🔗 Interactive Consent Link Generated!');
      setRedirectUrl(outgoingPaymentGrant.interact.redirect);
      
      let elapsedSeconds = 0;
      const MAX_TIMEOUT_SECONDS = 120; 

      while (!stateBridge.interactRef) {
        if (elapsedSeconds >= MAX_TIMEOUT_SECONDS) {
          throw new Error('❌ Transaction Timed Out: User abandoned or failed to approve payment.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        elapsedSeconds++;
      }

      console.log(`🚀 reference received! Continuing token evaluation...`);
      const continuation = await client.grant.continue(
        {
          url: outgoingPaymentGrant.continue.uri,
          accessToken: outgoingPaymentGrant.continue.access_token.value,
        },
        { interactRef: stateBridge.interactRef }
      );

      if (isPendingGrant(continuation) || !continuation.access_token) {
        throw new Error('Grant continuation failed to issue an access token.');
      }
      finalAccessToken = continuation.access_token.value;
    } else {
      finalAccessToken = outgoingPaymentGrant.access_token.value;
    }

    console.log("➡️ Step 7: Executing Final Outgoing Payment...");
    const outgoingPayment = await client.outgoingPayment.create(
      { url: senderWallet.resourceServer, accessToken: finalAccessToken },
      { walletAddress: senderWalletUrl, quoteId: quote.id }
    );

    console.log('\n🎉 TRANSACTION COMPLETED SUCCESSFULLY!');
    stateBridge.interactRef = null;

  } catch (error: any) {
    // 💡 AGGRESSIVE ERROR UNPACKING
    console.error('\n================ ❌ CRASH DETECTED ================');
    console.error('MESSAGE:', error.message);
    if (error.status) console.error('HTTP STATUS:', error.status);
    if (error.description) console.error('DESCRIPTION:', error.description);
    if (error.validationErrors) console.error('VALIDATION:', JSON.stringify(error.validationErrors, null, 2));
    if (error.response?.data) console.error('RESPONSE DATA:', JSON.stringify(error.response.data, null, 2));
    if (error.cause) console.error('ROOT CAUSE:', error.cause);
    console.error('===================================================\n');
    
    stateBridge.error = error.description || error.message;
    throw error;
  }
}