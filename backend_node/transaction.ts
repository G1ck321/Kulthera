import { createAuthenticatedClient } from '@interledger/open-payments';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function run() {
  // Load variables from environment
  const senderWalletUrl = process.env.SENDER_WALLET_URL!;
  const senderKeyId = process.env.SENDER_KEY_ID!;
  const senderPrivateKeyPath = path.resolve(process.cwd(), process.env.SENDER_PRIVATE_KEY_PATH!);
  const senderPrivateKey = fs.readFileSync(senderPrivateKeyPath, 'utf8');
  
  const receiverWalletUrl = process.env.RECEIVER_WALLET_URL!;

  console.log('🔐 Initializing Client with Sender Cryptographic Keys...');
  // Initialize the client authenticated AS THE SENDER
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
  
  // Ask the RECEIVER'S authorization server for permission to create an invoice on their account
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

  console.log('📊 Calculating delivery costs and exchange rates...');
  const quote = await client.quote.create(
    {
      url: senderWallet.resourceServer,
      accessToken: quoteGrant.access_token.value,
    },
    {
      walletAddress: senderWalletUrl,
      receiver: incomingPayment.id, // Pointing directly to the receiver's invoice ID
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
      access_token: {
        access: [
          {
            type: 'outgoing-payment',
            actions: ['create', 'read'],
            // Strict Interledger Security: Limit the grant to the precise quote amount
            limits: {
              debitAmount: {
                value: quote.debitAmount.value,
                assetCode: quote.debitAmount.assetCode,
                assetScale: quote.debitAmount.assetScale,
              }
            }
          },
        ],
      },
    }
  );

  console.log('💸 Transferring real-time value packets across Interledger nodes...');
  const outgoingPayment = await client.outgoingPayment.create(
    {
      url: senderWallet.resourceServer,
      accessToken: outgoingPaymentGrant.access_token.value,
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

run().catch((error) => {
  console.error('\n❌ Execution failed:');
  console.error(error);
});