Think of Web Monetization as:

> A browser-native way for a visitor’s wallet to stream tiny payments to a website while the visitor is actively using it.

For the Living Internet Museum, that means:

> “While I am viewing Ada’s artwork, my wallet streams tiny payments to Ada. When I move to Yemi’s music exhibit, the stream switches to Yemi.”

First Principle
At the lowest level, Web Monetization is trying to solve this problem:

> The web is great at moving information continuously, but bad at moving value continuously.

Today, websites mostly earn through:
- ads
- subscriptions
- one-time payments
- platform revenue shares
- tips/donations

Those are chunky payment models.

Web Monetization asks:

> What if payment could work more like internet data?

When you watch a video, your browser does not download the whole internet at once. It receives small packets over time.

Web Monetization applies a similar idea to money:

> Instead of one big payment, send many tiny payments over time.

The Core Analogy

Imagine water flowing through a pipe.

A normal payment is like filling a bucket and handing it over:

User pays $10 once → Creator receives $10

Web Monetization is like opening a tap:

User views content → tiny value flows → creator receives value over time

If the visitor stays for 10 seconds, only a little flows.

If they stay for 10 minutes, more flows.

If they leave, the tap closes.

The Main Actors

There are four main parts:

1. Visitor
   The person browsing the museum.

2. Website
   The Living Internet Museum app.

3. Creator
   The person who owns the exhibit.

4. Wallet provider
   The service that holds/sends/receives money.

In the MVP, the wallet provider can be the Interledger Test Wallet, which uses test money.

The Creator Wallet Address

Each creator has a wallet address.

Example:

https://wallet.example/ada

This is like saying:

> “If someone wants to support Ada, send value here.”

In our app, each exhibit has a wallet address attached to it:

{
  title: "Aurora Protocol",
  creator: "Ada Chen",
  walletAddress: "https://wallet.interledger-test.dev/ada"
}

So the exhibit knows who should receive payment.

How The Website Tells The Browser Where To Pay

A web page declares its monetization destination using a special tag.

Conceptually:

<link rel="monetization" href="https://wallet.interledger-test.dev/ada" />

That means:

> “This page can receive Web Monetization payments at Ada’s wallet address.”

In the Living Internet Museum, we dynamically change that tag.

When the visitor opens Ada’s exhibit:

<link rel="monetization" href="ada-wallet" />

When they switch to Yemi’s exhibit:

<link rel="monetization" href="yemi-wallet" />

So the payment destination follows the visitor’s attention.

What The Browser Or Extension Does

The website itself does not hold the visitor’s money.

The app only says:

> “This is the current creator wallet address.”

Then the browser/extension/payment agent handles the actual payment flow.

Roughly:

Visitor opens exhibit
↓
Website exposes creator wallet address
↓
Browser/payment agent sees it
↓
Visitor wallet authorizes payment stream
↓
Tiny payments are sent over time
↓
Website receives events saying payment is active

This is important:

> The website should not see the visitor’s private keys, wallet password, or sensitive account details.

The wallet/payment agent handles that.

What Interledger Does

Interledger is the payment routing layer.

Analogy:

> Interledger is like internet routing, but for money.

On the internet, you do not care exactly which routers your data passes through. You just send data to an address, and protocols route it.

Interledger tries to do something similar for payments:

Sender wallet → payment network route → receiver wallet

The sender and receiver do not need to use the exact same internal ledger.

That is the big idea:

> Different wallets, currencies, or ledgers can interoperate through a shared protocol.

For the MVP, the test wallet lets us simulate this without real money.

Payment Stream vs Payment Packet
A payment stream is the overall flow.

A payment packet is one tiny unit inside that flow.

Analogy:

Stream = a video call
Packet = one small chunk of audio/video data

For money:

Payment stream = supporting Ada while viewing her exhibit
Payment packet = one tiny payment sent during that session

So if someone views an exhibit for 2 minutes, the wallet may send many tiny payments during that time.

How Tiny Are The Payments?

They can be extremely small.

The exact amount depends on:
- user wallet settings
- provider rules
- spending rate
- currency
- minimum sendable amount
- test vs real wallet

Example:

User budget: $0.60 per hour
That means:
$0.01 per minute
$0.005 per 30 seconds

So a 3-minute exhibit view might be worth around:

3 × $0.01 = $0.03

The point is not that one visit makes a creator rich.

The point is scale and fairness:

10 visitors × 30 seconds = tiny
10,000 visitors × real attention = meaningful

What Happens When The User Has No Wallet?

Then no real payment stream starts.

The museum should still work.

The app shows:

Connect wallet to support creators

In our MVP, we also have a demo stream fallback, so people can still understand the concept visually.

That means:

No wallet detected
↓
Show preview stream
↓
Explain that real streaming requires wallet setup

What Happens If The Wallet Has Insufficient Balance?

The stream pauses or fails gracefully.

Analogy:

> If the tap has no water behind it, no water flows.

The app should not crash. It should show:

Support paused
Wallet balance too low
Top up test wallet to continue supporting creators

The visitor can still browse. The creator just does not receive monetized support until the wallet has funds again.

How The App Knows Payment Is Happening

The Web Monetization layer can emit events.

Conceptually:

onMonetizationStart → show "Streaming"
onMonetizationProgress → animate value stream
onMonetizationStop → show "Paused"

So the app can react:

Payment inactive → grey indicator
Payment pending → connecting indicator
Payment active → glowing stream
Payment stopped → paused state

For the museum, this becomes the emotional UI:

Streaming support to Ada Chen

How This Works In Our MVP

Our app does this:

1. User opens an exhibit.
2. App finds the exhibit’s creator wallet address.
3. App injects monetization tags into the document head.
4. If Web Monetization is available, the wallet/payment agent can start streaming.
5. App shows the current monetization state.
6. Timer starts counting attention time.
7. Value stream animation activates.
8. User switches exhibit.
9. Old wallet address is removed.
10. New wallet address is inserted.

In simplified code:

const link = document.createElement("link");

link.rel = "monetization";
link.href = exhibit.walletAddress;

document.head.appendChild(link);

Then when leaving:

link.remove();

That is the core switch.

The Mental Model

The cleanest way to think about it:

Exhibit = content
Creator wallet = payment destination
Visitor attention = trigger
Web Monetization = browser payment signal
Interledger = value routing network
Wallet = money source/sink

Or even simpler:

Attention opens the tap.
Wallet supplies the value.
Interledger routes the value.
Creator receives the value.
The app visualizes the flow.

Why This Is Powerful

The magic is not just micropayments.

The magic is that payment becomes contextual.

You are not paying “the platform.”

You are supporting the exact creator whose work you are experiencing at that moment.

That is why the museum idea fits so well:

Look at Ada's art → Ada receives support
Listen to Yemi's music → Yemi receives support
Read Noura's poem → Noura receives support

The payment destination follows meaning.