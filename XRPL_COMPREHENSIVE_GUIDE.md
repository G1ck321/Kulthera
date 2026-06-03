# XRPL & Interledger: Complete Learning Guide

## 📚 Learning Path for Intermediate Developers (3-Day Familiarity)

This guide teaches XRPL and Interledger from first principles. Each section builds on the previous one.

---

## Part 1: The Fundamentals (Day 1)

### 1.1 What is XRPL? (The Restaurant Analogy)

**Simple Analogy:**
- **Traditional Bank**: Like a restaurant where you call ahead, wait for approval, and pay through their system
- **XRPL**: Like a direct payment system where you and the recipient are in the same room—payment happens instantly without middlemen

**In Technical Terms:**
```
Restaurant (Traditional):
  You → Call Bank → Bank validates → Bank transfers → Recipient gets money
  Time: 1-3 days, Cost: Fees involved

XRPL (Peer-to-Peer):
  You → XRPL Network → Consensus achieved → Recipient confirmed
  Time: 4-6 seconds, Cost: Minimal (drops)
```

**Key Concepts:**
- **Ledger**: A shared record book that everyone trusts (not controlled by one bank)
- **XRP Token**: The currency on XRPL (like dollars in a bank)
- **Testnet**: Practice ledger where you get fake XRP for testing (no real money)
- **Mainnet**: Real ledger where real money lives

### 1.2 What is Interledger Protocol (ILP)?

**The Bridge Analogy:**
```
Without ILP (separate networks):
  Bank A Network → Can't directly reach → Bank B Network
  
With ILP (the bridge):
  Bank A → Interledger Bridge → Bank B
  "I can send money from any currency to any currency"
```

**Why ILP Matters:**
- **Connects different payment systems**: XRPL, traditional banks, payment apps
- **Converts currencies**: 1 USD → 100 Pesos automatically
- **Uses payment pointers**: `https://ilp.interledger-test.dev/username` (like a bank account number)

### 1.3 HTTP Requests: The Foundation

**What You Need to Know:**
All interactions with XRPL/ILP are done via **HTTP requests** - the same protocol your browser uses.

**The HTTP Request Cycle:**

```
┌─────────────────────────────────────────────────┐
│  YOUR COMPUTER                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Python Script                            │  │
│  │ requests.post("https://wallet.../api")   │  │
│  └──────────────────────────────────────────┘  │
│           ↓ (sends HTTP request)               │
├─────────────────────────────────────────────────┤
│  INTERNET                                       │
│  (encrypted connection)                         │
├─────────────────────────────────────────────────┤
│  SERVER (wallet.interledger-test.dev)           │
│  ┌──────────────────────────────────────────┐  │
│  │ Receives your request                    │  │
│  │ Validates format & signature             │  │
│  │ Processes payment                        │  │
│  │ Sends JSON response back                 │  │
│  └──────────────────────────────────────────┘  │
│           ↓ (sends HTTP response)              │
└─────────────────────────────────────────────────┘
│  YOUR COMPUTER                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Python receives response                 │  │
│  │ Parses JSON                              │  │
│  │ Continues execution                      │  │
│  └──────────────────────────────────────────┘  │
```

**HTTP Status Codes You'll See:**
```
200 OK              → Success! Request worked
201 Created         → Success! Resource created (payment made)
400 Bad Request     → Your request format was wrong
401 Unauthorized    → Invalid or missing token
403 Forbidden       → You don't have permission
404 Not Found       → Endpoint doesn't exist
405 Method Not Allowed → Wrong HTTP method (POST vs GET)
500 Server Error    → Server crashed
```

**The Python `requests` Library:**

```python
import requests

# GET: Retrieve data (like reading from a database)
response = requests.get("https://wallet.../account")

# POST: Send data and create something (like submitting a form)
response = requests.post(
    "https://wallet.../payment",
    json={"amount": 100},        # Data to send
    headers={"Authorization": "Bearer TOKEN"}  # Authentication
)

# Check if successful
if response.status_code in [200, 201]:
    data = response.json()      # Parse response as JSON
    print(data)
else:
    print(f"Error: {response.text}")  # Show error message
```

### 1.4 Authentication Tokens: The Key to Your Wallet

**The Lock & Key Analogy:**
```
Your Wallet = A safe with your money
Authorization Token = The only key to that safe
Server = Guard checking if you have the right key

Request without token:
  Guard: "Who are you?"
  You: "I'm John!"
  Guard: "Anyone can say that. No entry."  → 401 Unauthorized

Request with token:
  Guard: "Who are you?"
  You: "I'm John with this key: abc123xyz..."
  Guard: "Yep, that's the right key. Come in."  → 200 OK
```

**How Tokens Work in Code:**

```python
# Get token (usually from login or API settings)
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use token in request header
headers = {
    "Authorization": f"Bearer {token}",  # Sends the key
    "Content-Type": "application/json"
}

response = requests.post(
    "https://wallet.../incoming-payments",
    json={"walletAddress": "https://ilp.../bob"},
    headers=headers  # ← Token goes here
)
```

### 1.5 JSON: The Data Format

**What is JSON?**
JSON = JavaScript Object Notation = A standard format for sending data

```python
# Python dictionary → JSON (when sending)
payment_data = {
    "walletAddress": "https://ilp.interledger-test.dev/alice",
    "incomingAmount": {
        "value": "1000000",       # Amount in drops (smallest unit)
        "assetCode": "XRP",       # Currency
        "assetScale": 6           # Decimal places (6 = drops)
    }
}

# Send as JSON
requests.post(url, json=payment_data)

# JSON response → Python dictionary (when receiving)
response = requests.post(url, json=payment_data)
data = response.json()  # Converts from JSON to Python dict

# Access nested data
payment_id = data["id"]
amount = data["incomingAmount"]["value"]
```

**Common JSON Structure Pattern:**
```json
{
  "id": "unique-identifier",
  "status": "pending",
  "error": null,
  "details": {
    "nested": "value"
  }
}
```

---

## Part 2: Setting Up Your Environment (Day 1)

### 2.1 Creating Your Test Wallet

**Step-by-Step:**

1. **Open Browser**: Go to `https://wallet.interledger-test.dev`
2. **Create Account**: Click "Sign Up"
   - Use your email
   - Create a password
   - Verify email
3. **Get Your ILP Address**: After login, you'll see something like:
   ```
   Your Interledger Payment Pointer:
   https://ilp.interledger-test.dev/your_username
   ```
4. **Get Test Funds**: The wallet gives you fake XRP automatically for testing

**What Each Part of the ILP Address Means:**

```
https://ilp.interledger-test.dev/alice
 ↑                              ↑      ↑
 |                              |      └─ Your unique username
 |                              └─ Interledger test network
 └─ It's a web address (HTTPS = encrypted)
```

### 2.2 Getting Your API Token

**Why You Need a Token:**
Your token is like a password for API access. It proves to the server: "This is really Alice making this request"

**How to Get It:**

1. Login to `https://wallet.interledger-test.dev`
2. Go to Settings/Account
3. Look for "Developer" or "API Access"
4. Generate or copy your access token
5. Keep it SECRET (never commit to git, never share)

**Token Security:**
```
❌ NEVER do this:
  token = "abc123xyz"  # In code file
  git commit -m "Added token"  # Pushed to GitHub!

✅ DO THIS:
  import os
  token = os.environ.get("API_TOKEN")  # Load from environment
  # Set in terminal: export API_TOKEN="abc123xyz"
```

---

## Part 3: Understanding Payments (Day 2)

### 3.1 The Payment Flow: Step by Step

**Scenario:** Alice sends 1 XRP to Bob

```
STEP 1: Alice Creates Invoice for Bob
  Alice → Server: "Create incoming payment pointing to Bob's wallet"
  Server → Alice: "Here's invoice ID: inv_12345"
  
STEP 2: Alice Gets Price Quote
  Alice → Server: "If I send 1 XRP, what will Bob receive after fees?"
  Server → Alice: "Quote: Send 1 XRP → Bob gets 0.999 XRP (0.001 fee)"
  
STEP 3: Alice Makes Payment
  Alice → Server: "Send 1 XRP to Bob using that quote"
  Server → Alice: "Payment sent! Transaction ID: tx_xyz"
  
STEP 4: Verification
  Bob → Server: "Do I have any new payments?"
  Server → Bob: "Yes! 0.999 XRP received from Alice"
```

### 3.2 API Endpoints Explained

**What is an Endpoint?**
An endpoint = A specific URL that does a specific action

```
Endpoint Pattern:
https://<resourceServer>/incoming-payments
    or
https://wallet.interledger-test.dev/{username}/incoming-payments
          ↑                  ↑                     ↑
          base               resource owner        action
                
Like a postal address:
  Country → City → Street → Building Number → Apartment Number
```

**Common Endpoints:**

```
GET  /alice/account
     → Retrieves Alice's account details

POST /alice/incoming-payments
     → Creates new incoming payment FOR Alice (her invoice)

GET  /alice/incoming-payments
     → Lists all incoming payments to Alice

POST /alice/outgoing-payments
     → Creates payment FROM Alice (she's sending)

GET  /alice/quotes
     → Gets quote for a payment
```

### 3.3 The Wallets Dictionary

**In Our Code, We Store:**

```python
wallet = {
    "id": "https://ilp.interledger-test.dev/alice",     # Your pointer
    "resourceServer": "https://ilp.interledger-test.dev/uuid",  # API base
    "incomingPayment": "https://.../incoming-payments",
    "outgoingPayment": "https://.../outgoing-payments",
    "quotes": "https://.../quotes",
    "assetCode": "USD",         # Currency type
    "assetScale": 2              # Decimal precision (2 = cents)
}
```

**Why This Structure?**
- Contains all URLs needed for payments
- Keeps code DRY (Don't Repeat Yourself)
- Easy to add new networks later

### 3.4 Understanding Amount Fields

**Money Has Two Representations:**

```
User-Friendly:  1 USD
Technical:      100 cents (smallest unit)

Analogy: 
  1 Dollar = 100 Cents
    1 USD = 100 cents

Why two formats?
  - Users understand "1 XRP"
  - Computers avoid decimal rounding errors with "1000000"
```

**In Requests:**

```python
# User wants to send 1 USD
user_amount_xrp = 1.0

# Convert to base units for API
amount_drops = int(user_amount_xrp * 100)  # 100

# Send in payload
payload = {
    "incomingAmount": {
        "value": str(amount_drops),     # "100"
        "assetCode": "USD",
        "assetScale": 2                 # Means: divide by 10^2
    }
}
```

---

## Part 4: Common Errors & What They Mean (Day 2)

### 4.1 HTTP 400: Bad Request

**Error Message:**
```
HTTP 400: {"error": {"description": "body must have required property 'walletAddress'"}}
```

**What Happened:**
Your request JSON is missing a required field or the API contract changed.

This usually means one of these:
- You did not include `walletAddress`
- You used the wrong endpoint path
- You built the URL from the ILP pointer instead of the wallet's `resourceServer`
- Your `assetCode` / `assetScale` do not match the wallet metadata

**Example:**
```python
# ❌ WRONG - Missing walletAddress
payload = {
    "incomingAmount": {"value": "1000000"}
}

# ✅ RIGHT - Has all required fields
payload = {
    "walletAddress": "https://ilp.interledger-test.dev/alice",
    "incomingAmount": {"value": "100", "assetCode": "USD", "assetScale": 2}
}
```

**How to Fix:**
1. Check API documentation for required fields
2. Print your payload before sending: `print(json.dumps(payload, indent=2))`
3. Compare with examples

### 4.2 HTTP 401: Unauthorized

**Error Message:**
```
HTTP 401: Unauthorized
```

**What Happened:**
Your token is invalid, expired, or missing.

**Common Causes:**
```
❌ Token missing from header
❌ Token expired (some tokens expire after hours)
❌ Token for wrong wallet
❌ Typo in token
❌ Token pasted with extra spaces
```

**How to Fix:**
```python
# Check token exists
if not token or token == "":
    print("Error: Token is empty!")
    return

# Check header format
headers = {
    "Authorization": f"Bearer {token}",  # Exact format matters!
    "Content-Type": "application/json"
}

# Make sure Bearer + space before token
```

### 4.3 HTTP 405: Method Not Allowed

**Error Message:**
```
HTTP 405: Method Not Allowed
```

**What Happened:**
You're using the wrong HTTP method. Like trying to use GET where POST is required.

**Example:**
```python
# ❌ WRONG - Using GET to create something
response = requests.get(
    "https://wallet.../incoming-payments",
    json={"walletAddress": "..."}  # GET doesn't accept json body
)

# ✅ RIGHT - Using POST to create
response = requests.post(
    "https://wallet.../incoming-payments",
    json={"walletAddress": "..."}
)
```

**Method Guide:**
```
GET    → Retrieve data (no changes)
POST   → Create something new (create payment)
PUT    → Update existing (modify payment)
DELETE → Remove something (cancel payment)
```

### 4.4 JSON Parsing Errors

**Error Message:**
```
Expecting value: line 1 column 1 (char 0)
```

**What Happened:**
Server returned HTML instead of JSON. Likely received a web page (error page).

**Why This Happens:**
```
❌ You requested: https://ilp.interledger-test.dev/alice
   But this is a WEB ADDRESS (returns HTML web page)
   
✅ You should request: https://wallet.../alice/incoming-payments
   This is an API ENDPOINT (returns JSON)
```

**How to Fix:**
```python
response = requests.get(url)

# Check if response is actually JSON
try:
    data = response.json()
except json.JSONDecodeError:
    print(f"Response was HTML, not JSON:")
    print(f"First 500 chars: {response.text[:500]}")
    print(f"URL was: {url}")
```

### 4.5 Network/Connection Errors

**Error Message:**
```
ConnectionError: Failed to establish a new connection
```

**What Happened:**
Can't reach the server. Either:
- Server is down
- Internet is down
- URL is wrong

**How to Fix:**
```python
import requests

try:
    response = requests.get(url, timeout=10)
except requests.exceptions.Timeout:
    print("Server too slow (took > 10 seconds)")
except requests.exceptions.ConnectionError:
    print("Can't reach server. Check:")
    print("  1. Internet connection")
    print("  2. URL spelling")
    print("  3. Is server running?")
```

### 4.6 Missing `incomingPayment` Endpoint

**Error Message:**
```text
No incomingPayment URL in wallet data
Available keys: ['id', 'publicName', 'assetCode', 'assetScale', 'authServer', 'resourceServer', 'cardService']
```

**What Happened:**
The wallet discovery response is valid, but it does not include the ready-made payment endpoints. Instead, it exposes `resourceServer`, which is the base URL used to build them.

**How to Fix:**
1. Use `resourceServer` as the base for payment endpoints.
2. Build `incoming-payments`, `outgoing-payments`, and `quotes` from that base.
3. Use the wallet's own `assetCode` and `assetScale` when building amounts.

**Rule of Thumb:**
If the wallet response has `resourceServer`, treat it like the kitchen entrance to the payment API. `id` is the sign on the building; `resourceServer` is the door you actually walk through.

### 4.7 GNAP Grant Rejected With HTTP 400

**Error Message:**
```text
STEP 2: REQUEST AUTHORIZATION (GNAP Grant)
Grant request failed (HTTP 400)
```

**What Happened:**
The auth server expected a signed GNAP / DPoP-style request, but the script sent an unsigned JSON body. In other words, the request had the right general idea, but not the proof that the server needs to trust it.

**Why This Happens:**
- The auth server is not a simple username/password endpoint.
- It may require developer credentials, signing keys, or a browser-based login flow.
- A plain `requests.post()` is often not enough.

**How to Fix:**
1. Use a real wallet access token from the wallet UI when available.
2. Or implement the full signed GNAP / DPoP flow with developer keys.
3. If you only need to test the rest of the flow, fall back to a manually pasted token instead of a fake one.

**Analogy:**
Think of GNAP like entering a secure building. A name alone is not enough; you also need a badge that proves you belong there.

---

## Part 5: The Code Architecture (Day 2)

### 5.1 Function Structure

**Each Step is a Separate Function:**

```
main()
├── step1_register_wallet()
│   └─ Gets user's ILP address
├── step2_get_wallet_details()
│   └─ Fetches wallet configuration
├── step2b_get_receiver_wallet()
│   └─ Fetches receiver's wallet
├── step3_get_auth_token()
│   └─ Gets authorization token
├── step4_create_incoming_payment()
│   └─ Creates invoice for receiver
├── step5_get_quote()
│   └─ Gets price quote with fees
├── step6_execute_payment()
│   └─ Executes actual payment
└── step7_verify_transaction()
    └─ Verifies payment succeeded
```

**Why Separate Functions?**
- Easy to test each step independently
- Easy to find bugs (know exactly which step failed)
- Reusable code
- Clear flow

### 5.2 Error Handling Pattern

**Every Function Should:**

```python
def step_do_something(required_input):
    print("Starting...")
    
    # Check input
    if not required_input:
        print("❌ ERROR: Missing input")
        return None  # Stop here
    
    # Try the operation
    try:
        result = requests.post(
            url,
            json=payload,
            headers=headers
        )
        
        # Check response
        if result.status_code != 200:
            print(f"❌ HTTP {result.status_code}: {result.text}")
            return None
        
        # Success!
        data = result.json()
        print(f"✅ Success: {data}")
        return data
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None
```

**The Pattern:**
```
Check inputs → Try operation → Check response → Handle errors → Return result
```

---

## Part 6: Customizing for Your Needs (Day 3)

### 6.1 Modifying Amounts

**Default is 1 XRP:**

```python
# In main():
incoming = step4_create_incoming_payment(receiver_wallet, token, amount_xrp=1.0)
                                                                  ↑
                                                        Change this number

# Example: Send 5 XRP
incoming = step4_create_incoming_payment(receiver_wallet, token, amount_xrp=5.0)

# Example: Send 0.1 XRP
incoming = step4_create_incoming_payment(receiver_wallet, token, amount_xrp=0.1)
```

**Understanding the Conversion:**

```python
def send_xrp(amount_xrp):
    # Convert user-friendly format to drops
    amount_drops = int(amount_xrp * 1_000_000)
    return amount_drops

send_xrp(1.0)    # → 1000000
send_xrp(0.5)    # → 500000
send_xrp(10.0)   # → 10000000
```

### 6.2 Changing Currencies

**Best practice: read the currency from the wallet metadata instead of hardcoding it.**

```python
asset_code = receiver_wallet.get("assetCode", "USD")
asset_scale = receiver_wallet.get("assetScale", 2)
```

**To support other currencies:**

```python
def step4_create_incoming_payment(receiver_wallet, token, amount=1.0, asset_code="XRP"):
    """
    asset_code: "USD" (cents), "XRP" (drops), etc.
    """
    
    # Different currencies have different scales
    scales = {
        "XRP": 6,      # 1 XRP = 1,000,000 drops
        "USD": 2,      # 1 USD = 100 cents
        "EUR": 2,      # 1 EUR = 100 cents
    }
    
    scale = scales.get(asset_code, 2)
    amount_base_units = int(amount * (10 ** scale))
    
    payload = {
        "walletAddress": receiver_wallet.get("id"),
        "incomingAmount": {
            "value": str(amount_base_units),
            "assetCode": asset_code,
            "assetScale": scale
        }
    }
    # ... rest of function
```

### 6.3 Adding Logging to File

**Default only prints to console.**

**Add File Logging:**

```python
import logging
from datetime import datetime

# Set up logging
log_filename = f"payment_log_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_filename),  # Write to file
        logging.StreamHandler()             # Also print to console
    ]
)

logger = logging.getLogger(__name__)

# In functions:
logger.info(f"Creating payment for {receiver_wallet.get('id')}")
logger.error(f"Failed with HTTP {response.status_code}")
```

### 6.4 Batch Payments

**Send multiple payments:**

```python
def send_batch_payments(receivers, token, amount_per_payment=1.0):
    """Send payment to multiple receivers"""
    
    results = []
    
    for receiver_address in receivers:
        print(f"\nProcessing {receiver_address}...")
        
        # Get receiver wallet
        receiver_wallet = step2b_get_receiver_wallet(receiver_address)
        if not receiver_wallet:
            results.append({"receiver": receiver_address, "status": "failed"})
            continue
        
        # Create payment
        incoming = step4_create_incoming_payment(
            receiver_wallet, token, amount_xrp=amount_per_payment
        )
        if not incoming:
            results.append({"receiver": receiver_address, "status": "failed"})
            continue
        
        # Execute
        quote = step5_get_quote(sender_wallet, incoming, token)
        payment = step6_execute_payment(sender_wallet, quote, token)
        
        results.append({
            "receiver": receiver_address,
            "status": "success" if payment else "failed",
            "payment_id": payment.get("id") if payment else None
        })
    
    return results

# Usage:
receivers = [
    "https://ilp.interledger-test.dev/alice",
    "https://ilp.interledger-test.dev/bob",
    "https://ilp.interledger-test.dev/charlie"
]
results = send_batch_payments(receivers, token, amount_per_payment=0.5)
print(json.dumps(results, indent=2))
```

### 6.5 Integrating with Your Backend

**If using Flask:**

```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/send-payment', methods=['POST'])
def send_payment_endpoint():
    """HTTP endpoint to send payment"""
    
    try:
        # Get data from request
        data = request.json
        receiver = data.get('receiver_address')
        amount = float(data.get('amount', 1.0))
        
        # Get token from header or config
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        # Execute payment
        sender_wallet = step2_get_wallet_details(sender_address)
        receiver_wallet = step2b_get_receiver_wallet(receiver)
        
        incoming = step4_create_incoming_payment(receiver_wallet, token, amount)
        if not incoming:
            return jsonify({"error": "Could not create invoice"}), 400
        
        quote = step5_get_quote(sender_wallet, incoming, token)
        payment = step6_execute_payment(sender_wallet, quote, token)
        
        if payment:
            return jsonify({"success": True, "payment_id": payment.get("id")})
        else:
            return jsonify({"error": "Payment failed"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

---

## Part 7: Troubleshooting Checklist

**Before running script:**
- [ ] Created wallet at wallet.interledger-test.dev
- [ ] Got ILP address (looks like: https://ilp.interledger-test.dev/username)
- [ ] Generated API token from wallet settings
- [ ] Python has `requests` installed: `pip install requests`

**If payment fails:**
- [ ] Check token is valid (hasn't expired)
- [ ] Check both sender and receiver addresses are correct
- [ ] Check you have test funds (login to wallet, check balance)
- [ ] Check API endpoints are correct (print them out)
- [ ] Try test with smaller amount (0.1 XRP instead of 1 XRP)

**For debugging:**
```python
# Add these anywhere to see what's happening:
import json

print("=== DEBUGGING INFO ===")
print(f"Sender wallet: {json.dumps(sender_wallet, indent=2)}")
print(f"Receiver wallet: {json.dumps(receiver_wallet, indent=2)}")
print(f"Token: {token[:30]}...")
print(f"Request payload: {json.dumps(payload, indent=2)}")
print(f"Response status: {response.status_code}")
print(f"Response body: {response.text}")
```

---

## Summary

### What You Learned:
1. **XRPL is a decentralized ledger** - like a shared spreadsheet of transactions
2. **Interledger connects different networks** - enables cross-currency payments
3. **HTTP requests are fundamental** - understand status codes and JSON
4. **Authentication tokens are your key** - keep them secret
5. **Payment flow has 3 main steps** - Create invoice, get quote, execute
6. **Error handling is crucial** - always check response status

### Next Steps:
- Try small payments first (0.1 XRP)
- Monitor wallet.interledger-test.dev for updates
- Join XRPL community for advanced topics
- Read official XRPL docs: https://xrpl.org/

### Common Mistakes to Avoid:
- ❌ Hardcoding tokens in code
- ❌ Using mainnet token on testnet
- ❌ Not checking response status codes
- ❌ Forgetting to convert between XRP and drops
- ❌ Mixing up incoming/outgoing payment endpoints
- ❌ Not handling errors (try/except blocks)
- ❌ Assuming response is always JSON

---

## Quick Reference

```python
# Basic payment skeleton
import requests

sender_address = "https://ilp.interledger-test.dev/alice"
receiver_address = "https://ilp.interledger-test.dev/bob"
token = "your_api_token_here"

# 1. Get wallets
sender = {"id": sender_address, "outgoingPayment": "..."}
receiver = {"id": receiver_address, "incomingPayment": "..."}

# 2. Create incoming payment (invoice)
response = requests.post(
    receiver["incomingPayment"],
    json={
        "walletAddress": receiver["id"],
        "incomingAmount": {"value": "1000000", "assetCode": "XRP", "assetScale": 6}
    },
    headers={"Authorization": f"Bearer {token}"}
)
incoming = response.json()

# 3. Get quote (fees)
response = requests.post(
    sender["quotes"],
    json={"incomingPaymentId": incoming["id"]},
    headers={"Authorization": f"Bearer {token}"}
)
quote = response.json()

# 4. Execute payment
response = requests.post(
    sender["outgoingPayment"],
    json={"quoteId": quote["id"]},
    headers={"Authorization": f"Bearer {token}"}
)
payment = response.json()

print(f"Payment sent! ID: {payment.get('id')}")
```

---

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Complete for Day 3 Learning Path
