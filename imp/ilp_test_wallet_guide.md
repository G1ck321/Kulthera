# 🌍 Interledger Protocol (ILP) & Web Monetization Test Wallet Sandbox Guide

Welcome to the team's guide to achieving comfortability with the **Interledger Protocol (ILP)**, Open Payments, and the Web Monetization test wallet sandbox! 

This guide explains how micropayments are routed on the open web, where to find official specs on GitHub, and how to set up simulated play-money wallets to test our platform.

---

## 1. 💡 The Core Concepts (An Engineering Analogy)

To understand Interledger and Web Monetization, think of it like the **global email system (SMTP)**:

* **Email**: It doesn't matter if you use Gmail, Outlook, or your own private server. Because they all speak the SMTP open standard, you can send an email to anyone instantly.
* **Interledger (ILP)**: It is an open protocol for sending money. It doesn't matter if a creator is in Nigeria using a Naira bank account, and the visitor is in New York using an Apple Card or Bitcoin. The Interledger network routes, converts, and streams value instantly across ledger boundaries.
* **Payment Pointers (ILP Addresses)**: Structured like secure URL pathways prefixed by a dollar symbol:
  * Example: `$ilp.interledger-test.dev/kunle_drums`
  * This pointer acts as a sovereign target address. The browser extension queries this pointer to discover the wallet's Open Payments API endpoint, negotiates a payment pipe, and starts sending micro-value.

---

## 2. 🛠️ The Interledger Foundation Test Sandbox Setup

To test our Kultr platform with simulated money, follow this standard workflow:

### Step A: Register a Test Wallet
The Interledger Foundation hosts an open play-money test wallet sandbox.
1. Visit the Sandbox Wallet: **[https://wallet.interledger-test.dev](https://wallet.interledger-test.dev)** (or the active foundation testnet playground).
2. Sign up for a free developer sandbox account.
3. Once logged in, click **"Create Payment Pointer"** or **"Create Wallet Address"**.
4. Give it a name, e.g., `test_creator_alice`.
5. You will receive an active address like: `$ilp.interledger-test.dev/test_creator_alice`.
6. Click **"Fund"** or **"Add play-money"** to instantly inject simulated USD/XRP (e.g. $1,000,000) into your test account.

### Step B: Install the Browser Web Monetization Extension
Since Web Monetization is an emerging W3C standard, standard browsers (Chrome, Firefox, Edge) require an extension to read the `<link rel="monetization">` tags and route currency streams.
1. Download the official, open-source **Web Monetization Chrome Extension**:
   * Official GitHub: [https://github.com/interledger/web-monetization-extension](https://github.com/interledger/web-monetization-extension)
   * Available on the Chrome Web Store (search for "Web Monetization Extension" by Interledger).
2. Open the extension settings, and link it to your funded **Test Wallet Account** (acting as the visitor).
3. The extension is now loaded and listening! The moment you visit our Kultr museum and view an exhibit, the extension will detect our `<link rel="monetization">` tag, active the stream, and start transferring play-money from your visitor wallet to our seeded creators!

---

## 3. 📚 Key Documentation & Repositories to Bookmark

When you are ready to study the technical source code and specs on GitHub, explore these repositories:

* **[https://webmonetization.org/](https://webmonetization.org/)** - The official W3C Community Group portal with clear API standards and web guidelines.
* **[https://github.com/interledger/web-monetization-extension](https://github.com/interledger/web-monetization-extension)** - The core browser extension codebase. Fantastic for studying how the browser injects `window.monetization` events.
* **[https://github.com/interledger/open-payments](https://github.com/interledger/open-payments)** - The API specification for wallets supporting automated authorization, invoice creation, and payment requests.
* **[https://github.com/interledger/rafiki](https://github.com/interledger/rafiki)** - The ultimate open-source Interledger connector and wallet infrastructure. Most play-money sandbox accounts run on Rafiki services under the hood.

---

## 4. 🧪 How to Verify Live Web Monetization in Javascript

In our React client, we can write a simple console command or run this test check in our browser's DevTools console to see if the visitor has an active Web Monetization extension installed:

```javascript
// Test check: Query browser's global document monetization context
if (document.monetization) {
  console.log("✅ Web Monetization Provider Detected!");
  
  // Listen to active micro-payments streaming
  document.monetization.addEventListener('monetizationprogress', (event) => {
    console.log(`💸 Received Micropayment: ${event.detail.amount} ${event.detail.assetCode}`);
  });
} else {
  console.log("❌ No Web Monetization provider detected. Swapping to Kultr Simulator Mode.");
}
```
