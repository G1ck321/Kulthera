import express from 'express';
const app = express();
app.use(express.json());

app.post('/webhooks/open-payments', (req, res) => {
  const event = req.body;

  // 1. Verify the signature header sent by the wallet provider for security
  
  // 2. Handle the specific financial event
  switch (event.type) {
    case 'incoming_payment.completed':
      const paymentData = event.data;
      console.log(`Startup received ${paymentData.receivedAmount.value} from ${paymentData.walletAddress}`);
      // Upgrade user tier or update database here
      break;
      
    case 'outgoing_payment.failed':
      console.error(`Payment failed: ${event.data.error}`);
      break;
  }

  // 3. Always return a 200 OK quickly to acknowledge receipt
  res.status(200).send('Received');
});
