import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Force environmental initialization first
dotenv.config(); 

import { createAuthenticatedClient, isPendingGrant } from '@interledger/open-payments';
import { setRedirectUrl } from './bridge.js'; 

// Global state bridge for coordinating single-session human interaction loop
export const stateBridge = {
  interactRef: null as string | null,
  error: null as string | null // 💡 ADDED: Capture background runtime errors
};

// Module-level client definition preserves container instance state
let client: any = undefined;

/**
 * Utility helper to normalize Payment Pointers ($example.com -> https://example.com)
 */
function normalizeWalletUrl(url: string): string {
  const trimmed = url.trim();
  if (trimmed.startsWith('$')) {
    return `https://${trimmed.slice(1)}`;
  }
  return trimmed;
}

export async function run() {
  // Reset any error state from previous attempts
  stateBridge.error = null;

  try {
    const rawSenderWalletUrl = process.env.SENDER_WALLET_URL;
    const senderKeyId = process.env.SENDER_KEY_ID;
    const rawReceiverWalletUrl = process.env.RECEIVER_WALLET_URL;

    // Validate environmental profiles presence upfront
    if (!rawSenderWalletUrl || !senderKeyId || !rawReceiverWalletUrl) {
      throw new Error(
        `❌ CRITICAL: Missing environment configuration keys!\n` +
        `Ensure SENDER_WALLET_URL, SENDER_KEY_ID, and RECEIVER_WALLET_URL are set.`
      );
    }

    // 💡 FIX: Safely normalize payment pointers to full URL formats
    const senderWalletUrl = normalizeWalletUrl(rawSenderWalletUrl);
    const receiverWalletUrl = normalizeWalletUrl(rawReceiverWalletUrl);

    // 1. RENDER SECRET FILES RESOLUTION RULE
    const senderPrivateKeyPath = process.env.RENDER
      ? '/etc/secrets/private-key.pem' 
      : path.resolve(process.cwd(), process.env.SENDER_PRIVATE_KEY_PATH || 'private-key.pem');

    if (!fs.existsSync(senderPrivateKeyPath)) {
      throw new Error(`❌ Cryptographic Key Missing: Cannot find private key at path: ${senderPrivateKeyPath}`);
    }

    // 💡 FIX: Explicitly enforce 'utf-8' string encoding to avoid passing raw binary buffer
    const privateKey = fs.readFileSync(senderPrivateKeyPath, 'utf-8').trim();

    console.log(`🌐 Connecting Open Payments client identity to: ${senderWalletUrl}`);

    // Initialize or preserve authenticated client instance
    if (!client) {
     // Inside transaction.ts
client = await createAuthenticatedClient({
  walletAddressUrl: senderWalletUrl,
  privateKey: privateKey,
  keyId: senderKeyId,
  validateResponses: false // 👈 Add this line to bypass strict OpenAPI blocking
});
    }

    // 💡 SMART FALLBACK: Handle both new SDKs (walletAddress) and old SDKs (paymentPointer)
    const profileClient = client.walletAddress || client.paymentPointer;
    
    if (!profileClient) {
      throw new Error("❌ SDK Error: Could not bind wallet identity. Check your @interledger/open-payments version.");
    }

    // 2. Discover target wallet profiles
    const senderWallet = await profileClient.get({ url: senderWalletUrl });
    const receiverWallet = await profileClient.get({ url: receiverWalletUrl });

    // 3. Establish incoming dynamic quote agreements
    const incomingPaymentGrant = await client.grant.request(
      { url: receiverWallet.authServer },
      {
        access_token: {
          access: [{ type: 'incoming-payment', actions: ['create', 'read'] }],
        },
      }
    );

    if (isPendingGrant(incomingPaymentGrant)) {
      throw new Error('❌ Interledger setup failed: Incoming payment credentials cannot be pending.');
    }

    const incomingPayment = await client.incomingPayment.create(
      { url: receiverWallet.resourceServer, accessToken: incomingPaymentGrant.access_token.value },
      {
        walletAddress: receiverWalletUrl,
        incomingAmount: { 
          value: '500', 
          assetCode: receiverWallet.assetCode,   // ✅ CORRECT
          assetScale: receiverWallet.assetScale  // ✅ CORRECT
        },
      }
    );
    // 4. Request transaction quotation metrics
    const quoteGrant = await client.grant.request(
      { url: senderWallet.authServer },
      {
        access_token: {
          access: [{ type: 'quote', actions: ['create', 'read'] }],
        },
      }
    );

    if (isPendingGrant(quoteGrant)) {
      throw new Error('❌ Interledger setup failed: Quote execution credentials cannot be pending.');
    }

    const quote = await client.quote.create(
      { url: senderWallet.resourceServer, accessToken: quoteGrant.access_token.value },
      {
        walletAddress: senderWalletUrl,
        receiver: incomingPayment.id,
        method: 'ilp'  // 💥 ADD THIS LINE
      }
    );

    // 5. Build full interactive user debit grant contract
    const outgoingPaymentGrant = await client.grant.request(
      { url: senderWallet.authServer },
      {
        access_token: {
          access: [
            {
              type: 'outgoing-payment',
              actions: ['create', 'read'],
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
            nonce: crypto.randomUUID(), // ✅ DYNAMIC (Requires: import * as crypto from 'crypto'; at the top of file)
          },
        },
      }
    );

    let finalAccessToken: string;

    if (isPendingGrant(outgoingPaymentGrant)) {
      console.log('🔗 Interactive Consent Link Generated!');
      setRedirectUrl(outgoingPaymentGrant.interact.redirect);
      console.log('⏳ Awaiting authorization reference string parameters from your web browser...');

      // 💡 FIX: Added Timeout Safeguard counter to eliminate Infinite Memory Leaks
      let elapsedSeconds = 0;
      const MAX_TIMEOUT_SECONDS = 120; // 2 Minutes Max

      while (!stateBridge.interactRef) {
        if (elapsedSeconds >= MAX_TIMEOUT_SECONDS) {
          throw new Error('❌ Transaction Timed Out: User abandoned or failed to approve payment within 2 minutes.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        elapsedSeconds++;
      }

      const finalRef = stateBridge.interactRef;
      console.log(`🚀 reference received! Continuing token evaluation: ${finalRef}`);

      const continuation = await client.grant.continue(
        {
          url: outgoingPaymentGrant.continue.uri,
          accessToken: outgoingPaymentGrant.continue.access_token.value,
        },
        { interactRef: finalRef }
      );

      if (isPendingGrant(continuation) || !continuation.access_token) {
        throw new Error('Grant continuation failed to issue an access token.');
      }
      finalAccessToken = continuation.access_token.value;
    } else {
      finalAccessToken = outgoingPaymentGrant.access_token.value;
    }

    console.log('💸 Transferring real-time value packets across Interledger nodes...');
    const outgoingPayment = await client.outgoingPayment.create(
      { url: senderWallet.resourceServer, accessToken: finalAccessToken },
      { walletAddress: senderWalletUrl, quoteId: quote.id }
    );

    console.log('\n🎉 TRANSACTION COMPLETED SUCCESSFULLY!');
    console.log(`🔹 Outgoing Tx ID: ${outgoingPayment.id}`);
    
    // Clean state on finish
    stateBridge.interactRef = null;

  } catch (error: any) {
    // 💡 Unwrap the SDK's hidden OpenAPI validation errors
    const errorDetails = error.validationErrors 
      || error.response?.data 
      || error.message;

    console.error('❌ Internal Open Payments Failure Details:', JSON.stringify(errorDetails, null, 2));
    
    stateBridge.error = typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails);
    throw error;
  }
}