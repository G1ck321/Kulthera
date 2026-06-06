import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { run, stateBridge } from './transaction.js';

const app = express();

// Dynamically scale CORS domains according to environment states
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

let savedRedirectUrl: string | null = null;

/**
 * Shared modifier function populated by transaction context
 */
export function setRedirectUrl(url: string) {
  savedRedirectUrl = url;
}

app.post('/create-grant', async (req, res) => {
  console.log('⚡ UI initiated transaction sequence.');
  
  // Clear routing state machines before launch
  stateBridge.interactRef = null;
  stateBridge.error = null;
  savedRedirectUrl = null;

  // Spin transaction orchestration off inside background thread
  run().catch((error) => {
    console.error('❌ Async Context Failure Caught:', error.message);
  });

  // Poll for output generation 
  let attempts = 0;
  const maxAttempts = 14; // 7 seconds total check sequence

  while (!savedRedirectUrl && !stateBridge.error && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    attempts++;
  }

  // 💡 FIX: If an SDK client handshake failure or file missing error happens, return it immediately
  if (stateBridge.error) {
    return res.status(500).json({ 
      error: 'Failed to build transaction channel.', 
      details: stateBridge.error 
    });
  }

  if (savedRedirectUrl) {
    return res.json({ redirectUrl: savedRedirectUrl });
  } else {
    return res.status(500).json({ error: 'Timed out waiting for context generation.' });
  }
});

app.post('/finalize-payment', async (req, res) => {
  const { interactRef } = req.body;
  if (!interactRef) return res.status(400).json({ error: 'Missing interactRef payload.' });

  console.log(`✅ reference registered: ${interactRef}`);
  stateBridge.interactRef = interactRef; 
  
  res.json({ success: true, message: 'Forwarded to transaction processing pipeline.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Open Payments Integration Bridge listening on port: ${PORT}`);
});