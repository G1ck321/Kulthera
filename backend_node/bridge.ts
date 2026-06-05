import express from 'express';
import cors from 'cors';
import { run, stateBridge } from './transaction.ts';

const app = express();
app.use(cors());
app.use(express.json());

// Global tracker to hold the dynamic redirect URL returned by Rafiki
let savedRedirectUrl: string | null = null;

app.post('/create-grant', async (req, res) => {
  console.log('⚡ UI initiated transaction.');
  
  // Reset previous state properties
  stateBridge.interactRef = null;
  savedRedirectUrl = null;

  // 1. Kick off the transaction.ts function execution in the background asynchronously
  run().catch((error) => console.error('❌ Background Transaction Error:', error));

  // 2. Poll briefly for the dynamic redirect URL to generate without blocking the thread
  let attempts = 0;
  while (!savedRedirectUrl && attempts < 10) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    attempts++;
  }

  if (savedRedirectUrl) {
    return res.json({ redirectUrl: savedRedirectUrl });
  } else {
    return res.status(500).json({ error: 'Timed out waiting for Open Payments redirect initialization.' });
  }
});

app.post('/finalize-payment', async (req, res) => {
  const { interactRef } = req.body;
  if (!interactRef) return res.status(400).json({ error: 'Missing ref parameter payload.' });

  console.log(`✅ reference locked from browser context: ${interactRef}`);
  stateBridge.interactRef = interactRef; // Releases the pending loop inside transaction.ts
  
  res.json({ success: true, message: 'Reference routed to Interledger lifecycle context.' });
});

// Expose a helper setter that transaction.ts can push URLs to
export function setRedirectUrl(url: string) {
  savedRedirectUrl = url;
}

app.listen(4000, () => console.log('🚀 Open Payments Bridge Online: Port 4000'));
