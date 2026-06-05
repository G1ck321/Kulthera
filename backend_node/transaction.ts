import { createAuthenticatedClient, isPendingGrant } from '@interledger/open-payments';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { setRedirectUrl } from './bridge.ts'; // Import the setter module helper

dotenv.config();

// 1. Add this reference tracker object at the very top of your file
export const stateBridge = {
  interactRef: null as string | null
};

export async function run() {
  // Load variables from environment
  const senderWalletUrl = process.env.SENDER_WALLET_URL!;
  const senderKeyId = process.env.SENDER_KEY_ID!;
  const senderPrivateKeyPath = path.resolve(process.cwd(), process.env.SENDER_PRIVATE_KEY_PATH!);
  
  const senderPrivateKey = fs.readFileSync(senderPrivateKeyPath, 'utf8').trim();
  const receiverWalletUrl = process.env.RECEIVER_WALLET_URL!;

  console.log('🔐 Initializing Client with Sender Cryptographic Keys...');

  const client = await createAuthenticatedClient({
    walletAddressUrl: senderWalletUrl,
    keyId: senderKeyId,
    privateKey: senderPrivateKey,
  });

  // ----------------------------------------------------------------
  // STEP 1: RESOLVE BOTH WALLETS OVER THE INTERLEDGER NETWORK
  // ----------------------------------------------------------------
  console.log(`📡 Fetching SENDER wallet info: ${senderWalletUrl}`);
  const senderWallet = await client.walletAddress.get({ url: senderWalletUrl });

  console.log(`📡 Fetching RECEIVER wallet info: ${receiverWalletUrl}`);
  const receiverWallet = await client.walletAddress.get({ url: receiverWalletUrl });

  // ----------------------------------------------------------------
  // STEP 2: CREATE INCOMING PAYMENT (Executed on Receiver's Resource Server)
  // ----------------------------------------------------------------
  console.log('\n💳 Requesting Incoming Payment Grant from Receiver\'s Auth Server...');
  const incomingPaymentGrant = await client.grant.request(
    { url: receiverWallet.authServer },
    {
      access_token: {
        access: [
          {
            type: 'incoming-payment',
            actions: ['create', 'read'],
          },
        ],
      },
    }
  );

  // FIX: Explicitly narrow the type using the SDK guard to ensure access_token exists
    if (isPendingGrant(incomingPaymentGrant) || !incomingPaymentGrant.access_token) {
    throw new Error('Unexpected interactive request or missing token for generating receiver invoice.');
  }

  console.log('🚀 Creating Invoice (Incoming Payment) for Receiver...');
  const incomingPayment = await client.incomingPayment.create(
    {
      url: receiverWallet.resourceServer,
      accessToken: incomingPaymentGrant.access_token.value,
    },
    {
      walletAddress: receiverWalletUrl,
      incomingAmount: {
        value: '500', // 5.00 USD (Sent to receiver)
        assetCode: receiverWallet.assetCode,
        assetScale: receiverWallet.assetScale,
      },
      expiresAt: new Date(Date.now() + 60_000 * 10).toISOString(),
    }
  );

  console.log(`✅ Invoice Created! ID: ${incomingPayment.id} [Status: PENDING]`);

  // ----------------------------------------------------------------
  // STEP 3: GET A QUOTATION (Executed on Sender's Resource Server)
  // ----------------------------------------------------------------
  console.log('\n📈 Requesting Quote Grant from Sender\'s Auth Server...');
  const quoteGrant = await client.grant.request(
    { url: senderWallet.authServer },
    {
      access_token: {
        access: [
          {
            type: 'quote',
            actions: ['create', 'read'],
          },
        ],
      },
    }
  );

  // FIX: Narrow the type for quoteGrant to prove access_token is defined
  if (isPendingGrant(quoteGrant) || !quoteGrant.access_token) {
    throw new Error('Unexpected interactive request or missing token for parsing quote context values.');
  }

  console.log('📊 Calculating delivery costs and exchange rates...');
  const quote = await client.quote.create(
    {
      url: senderWallet.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: senderWalletUrl,
      receiver: incomingPayment.id,
      method: 'ilp', // FIX: Passed explicitly as required literal
    }
  );

  console.log(`✅ Quote Lock-In! Total Debit from Sender: ${quote.debitAmount.value} ${quote.debitAmount.assetCode}`);

  // ----------------------------------------------------------------
  // STEP 4: OUTGOING PAYMENT EXECUTION (Debiting Sender's Wallet)
  // ----------------------------------------------------------------
  console.log('\n🔒 Requesting Outgoing Payment Limit Grant from Sender\'s Auth Server...');
  const outgoingPaymentGrant = await client.grant.request(
  { url: senderWallet.authServer },
  {
    // FIX: Tell the Auth Server how you want the user to interact
    interact: {
  start: ['redirect'],
  finish: {
    method: 'redirect',
    uri: 'http://localhost:5173/payment-test.html', // MUST point directly to Vite, NOT port 4000
    nonce: crypto.randomUUID(),
  },
},
    access_token: {
      access: [
        {
          type: 'outgoing-payment',
          actions: ['create', 'read'],
          identifier: senderWalletUrl,
          limits: {
            debitAmount: {
              value: quote.debitAmount.value,
              assetCode: quote.debitAmount.assetCode,
              assetScale: quote.debitAmount.assetScale,
            },
          },
        },
      ],
    },
  }
);

  let finalAccessToken: string;

  // FIX: Use SDK type guard to determine if interaction sequence is mandatory
    if (isPendingGrant(outgoingPaymentGrant)) {
    console.log('\n🔗 Interactive Consent Link Generated!');
    
    // Pass the redirect URL up to the bridge layer so it can immediately respond to the HTML page
    setRedirectUrl(outgoingPaymentGrant.interact.redirect);
    
    console.log('⏳ Awaiting authorization reference string parameters from your web browser...');
    
    // Safely block here until the browser captures and returns the code parameter string
    while (!stateBridge.interactRef) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      {
        url: senderWallet.resourceServer,
        accessToken: finalAccessToken,
      },
      {
        walletAddress: senderWalletUrl,
        quoteId: quote.id,
      }
    );

    console.log('\n🎉 TRANSACTION COMPLETED SUCCESSFULLY!');
    console.log(`🔹 Outgoing Tx ID: ${outgoingPayment.id}`);
    console.log(`🔹 Settlement Status: ${outgoingPayment.failed ? '❌ Failed' : '✅ Settled & Cleared'}`);
    console.log(`\n👉 Check the Receiver's (${receiverWalletUrl}) dashboard. It will now show as "Completed"!`);
  }


    

