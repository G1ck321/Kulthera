# ILP Integration Guide for KULTR Backend

## Quick Reference: Live Testnet URLs

```python
# Real Interledger Foundation Test Wallets
SENDER_WALLET = "https://ilp.interledger-test.dev/annaetuk"
RECEIVER_WALLET = "https://ilp.interledger-test.dev/gbemzy"

# Asset Details
ASSET_CODE = "USD"
ASSET_SCALE = 2  # cents
```

---

## Implementation Steps

### 1. Wallet Discovery
```python
response = requests.get(wallet_url, headers={"Accept": "application/json"})
wallet_data = response.json()
# Returns: assetCode, assetScale, authServer, incomingPayment, outgoingPayment
```

### 2. Get Auth Grant (GNAP)
Need to:
- POST to `wallet_data['authServer']`
- Include cryptographic signature
- Request scope: `incoming-payment`
- Get back: `access_token`

### 3. Create Incoming Payment
```python
# POST to wallet_data['incomingPayment']
payload = {
    "incomingAmount": {
        "value": "500",      # 5.00 in cents
        "assetCode": "USD",
        "assetScale": 2
    },
    "expiresAt": "2026-12-31T23:59:59Z",
    "description": "KULTR Museum Exhibition"
}
headers = {"Authorization": f"Bearer {access_token}"}
```

### 4. Quote & Execute Outgoing Payment
```python
# Sender gets a quote, then executes payment
# POST to sender's outgoingPayment endpoint with:
# - incomingPaymentUrl
# - amount
# - sendingAmount or receivingAmount
```

---

## For KULTR Implementation

**Where to integrate:**
1. `backend/app/api/routes/analytics.py` - Record monetization events
2. `backend/app/schemas/creator.py` - Store `paymentPointer` field
3. `backend/app/models/creator.py` - Database persistence

**Endpoints needed:**
- `POST /api/analytics/monetization-event` - Log Web Monetization payments
- `POST /api/creators/{id}/wallets` - Save creator's ILP pointer
- `GET /api/creators/{id}/earnings` - Retrieve settlement history

**For Production:**
- Use `python-jose` for JWT/GNAP signatures
- Store sensitive keys in environment variables
- Implement webhook listeners for payment settlement notifications

---

## Testing the Demo

```bash
python ilp_open_payments_demo.py
```

Expected output: Complete payment flow from testnet wallets

---

## Resources

- **Open Payments Spec**: https://openpayments.dev
- **GNAP Protocol**: https://oauth.net/grant-negotiation-and-authorization-protocol/
- **Rafiki Wallet**: https://github.com/interledger/rafiki
- **ILP Testnet**: https://ilp.interledger-test.dev
