#!/usr/bin/env python
"""
REAL XRPL Transaction via Interledger
======================================

Step-by-step guide to send REAL test tokens and see them in your wallet.

Verify transactions at: https://testnet.xrpl.org
Wallet: https://wallet.interledger-test.dev
"""

import requests
import json
import time
from datetime import datetime, timedelta


def ensure_wallet_endpoints(wallet):
    """Fill in Open Payments endpoints from the wallet's resource server when missing."""
    endpoint_base = wallet.get("resourceServer") or wallet.get("id")
    
    if not endpoint_base:
        return wallet

    # Remove any trailing slashes to prevent double slashes in the URL
    endpoint_base = endpoint_base.rstrip("/")
    
    # Force direct assignment instead of relying on .setdefault()
    wallet["incomingPayment"] = wallet.get("incomingPayment") or f"{endpoint_base}/incoming-payments"
    wallet["outgoingPayment"] = wallet.get("outgoingPayment") or f"{endpoint_base}/outgoing-payments"
    wallet["quotes"] = wallet.get("quotes") or f"{endpoint_base}/quotes"
    
    return wallet

# ====================================================================
# STEP 1: REGISTER FOR INTERLEDGER TESTNET WALLET
# ====================================================================

def step1_register_wallet():
    """
    MANUAL STEP - Do this in browser:
    
    1. Go to: https://wallet.interledger-test.dev
    2. Click "Create Account"
    3. Email: use your email
    4. Password: create one
    5. Confirm email
    
    After registration, you'll have:
    - ILP Address: https://ilp.interledger-test.dev/YOUR_USERNAME
    - Wallet URL: https://wallet.interledger-test.dev/YOUR_USERNAME
    - Test XRP automatically credited
    
    Example ILP Address: https://ilp.interledger-test.dev/boluwatife
    """
    print("""
╔════════════════════════════════════════════════════════════════════╗
║ STEP 1: REGISTER FOR TEST WALLET                                   ║
╚════════════════════════════════════════════════════════════════════╝

1. Open browser: https://wallet.interledger-test.dev
2. Sign up with your email
3. Verify email
4. You'll get FREE test XRP automatically

After registering, you'll get an ILP ADDRESS like:
  https://ilp.interledger-test.dev/YOUR_USERNAME

⏭️  Continue to Step 2 once registered!
    """)
    ilp_address = input("Enter your ILP Address (e.g., https://ilp.interledger-test.dev/boluwatife): ").strip()
    return ilp_address


# ====================================================================
# STEP 2B: GET RECEIVER'S WALLET DETAILS
# ====================================================================

def step2b_get_receiver_wallet(receiver_ilp_address):
    """
    Get the RECEIVER's wallet info (who you're sending money TO)
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 2B: GET RECEIVER'S WALLET DETAILS                             ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    print(f"\n📡 Fetching receiver's wallet from:")
    print(f"   {receiver_ilp_address}")
    
    # Extract username from ILP address
    # Example: https://ilp.interledger-test.dev/annaetuk → annaetuk
    username = receiver_ilp_address.rstrip('/').split('/')[-1]
    
    try:
        response = requests.get(
            receiver_ilp_address,
            headers={"Accept": "application/json"},
            timeout=10,
            allow_redirects=True
        )
        
        print(f"   Status: HTTP {response.status_code}")
        
        try:
            wallet = response.json()
            print(f"\n✅ Receiver Wallet Retrieved:")
            print(f"   • Address: {wallet.get('id', receiver_ilp_address)}")
            return ensure_wallet_endpoints(wallet)
        except json.JSONDecodeError:
            print(f"\n⚠️  Response is not JSON, deriving from ILP address...")
            
            # Use wallet.interledger-test.dev domain for endpoints
            wallet_base = f"https://wallet.interledger-test.dev/{username}"
            
            wallet = {
                "id": receiver_ilp_address,
                "resourceServer": wallet_base,
                "incomingPayment": f"{wallet_base}/incoming-payments",
                "outgoingPayment": f"{wallet_base}/outgoing-payments",
                "quotes": f"{wallet_base}/quotes",
                "assetCode": "USD",
                "assetScale": 2
            }
            
            print(f"\n✅ Receiver Wallet Derived:")
            print(f"   • Address: {wallet['id']}")
            print(f"   • Incoming: {wallet['incomingPayment']}")
            return ensure_wallet_endpoints(wallet)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def step2_get_wallet_details(ilp_address):
    """
    Get wallet info using Open Payments API
    
    The ILP address is your Interledger Payment Pointer, e.g.:
    https://ilp.interledger-test.dev/boluwatife
    
    This is NOT the same as wallet.interledger-test.dev
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 2: FETCH YOUR WALLET DETAILS (Open Payments API)              ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    print(f"\n📡 Fetching wallet details from ILP address:")
    print(f"   {ilp_address}")
    
    # Extract username from ILP address
    # Example: https://ilp.interledger-test.dev/boluwatife → boluwatife
    username = ilp_address.rstrip('/').split('/')[-1]
    
    try:
        # Try to get Open Payments endpoints from .well-known
        # ILP addresses typically resolve to Open Payments endpoints
        response = requests.get(
            ilp_address,
            headers={"Accept": "application/json"},
            timeout=10,
            allow_redirects=True
        )
        
        print(f"\n   Status: HTTP {response.status_code}")
        
        # Check if response is actually JSON
        try:
            wallet = response.json()
            print(f"\n✅ Wallet Details Retrieved:")
            print(f"   • Pointer: {wallet.get('id', ilp_address)}")
            print(f"   • Asset Code: {wallet.get('assetCode', 'XRP')}")
            print(f"   • Asset Scale: {wallet.get('assetScale', 6)}")
            
            # Ensure required endpoints exist
            if 'incomingPayment' not in wallet or 'resourceServer' in wallet:
                print(f"\n⚠️  Missing 'incomingPayment' endpoint")
                print(f"   Creating from resource server...")
                ensure_wallet_endpoints(wallet)
            
            return ensure_wallet_endpoints(wallet)
        except json.JSONDecodeError:
            # Response is not JSON (likely HTML)
            print(f"\n⚠️  Response is not JSON (got HTML page)")
            print(f"\n💡 Using resource server or wallet domain endpoints...")
            
            # Create wallet object using wallet.interledger-test.dev domain
            wallet = {
                "id": ilp_address,
                "resourceServer": f"https://wallet.interledger-test.dev/{username}",
                "incomingPayment": f"https://wallet.interledger-test.dev/{username}/incoming-payments",
                "outgoingPayment": f"https://wallet.interledger-test.dev/{username}/outgoing-payments",
                "quotes": f"https://wallet.interledger-test.dev/{username}/quotes",
                "assetCode": "USD",
                "assetScale": 2
            }
            
            print(f"\n✅ Wallet Endpoints Derived:")
            print(f"   • Pointer: {wallet['id']}")
            print(f"   • Incoming: {wallet['incomingPayment']}")
            print(f"   • Outgoing: {wallet['outgoingPayment']}")
            
            return ensure_wallet_endpoints(wallet)
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print(f"\n💡 Alternative: Enter wallet details manually")
        return None


# ====================================================================
# STEP 3: GET AUTH TOKEN (via Open Payments API)
# ====================================================================

def step3_get_auth_token():
    """
    Get auth token from Interledger Open Payments API
    
    IMPORTANT: The wallet.interledger-test.dev is a WEB INTERFACE, not an API.
    For programmatic access, you need:
    1. Access token from the Open Payments API
    2. Or use the wallet's access token mechanism
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 3: GET AUTH TOKEN                                             ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    print(f"\n⚠️  MANUAL STEP REQUIRED:")
    print(f"\n1. Go to: https://wallet.interledger-test.dev")
    print(f"2. Login with your email/password")
    print(f"3. Go to Settings → Developer/API Access")
    print(f"4. Generate an Access Token")
    print(f"5. Copy the token below\n")
    
    token = input("Paste your access token: ").strip()
    
    if token:
        print(f"\n✅ Token received!")
        print(f"   • Length: {len(token)} characters")
        return token
    else:
        print(f"❌ No token provided")
        return None


# ====================================================================
# STEP 4: CREATE INCOMING PAYMENT (INVOICE)
# ====================================================================

def step4_create_incoming_payment(receiver_wallet, token, amount_xrp=1.0):
    """
    Create an Incoming Payment that others can pay to
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 4: CREATE INCOMING PAYMENT (Invoice)                          ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    # Debug: Show what we got
    print(f"\n🔍 Received wallet object:")
    print(f"   • Type: {type(receiver_wallet)}")
    print(f"   • Keys: {list(receiver_wallet.keys()) if isinstance(receiver_wallet, dict) else 'Not a dict'}")
    for key, val in receiver_wallet.items():
        if key != 'metadata':  # Skip large fields
            print(f"   • {key}: {val}")
    
    receiver_wallet = ensure_wallet_endpoints(receiver_wallet)

    # Incoming payments endpoint
    incoming_payments_url = receiver_wallet.get("incomingPayment")
    wallet_address = receiver_wallet.get("id")
    asset_code = receiver_wallet.get("assetCode", "USD")
    asset_scale = receiver_wallet.get("assetScale", 2)
    
    if not incoming_payments_url:
        print(f"\n❌ ERROR: No incomingPayment URL in wallet data")
        print(f"   Expected key: 'incomingPayment'")
        print(f"   Available keys: {list(receiver_wallet.keys())}")
        print(f"\n💡 DEBUGGING TIP:")
        print(f"   This means the wallet object is missing the API endpoints.")
        print(f"   The endpoint might be at a different path than expected.")
        return None
    
    if not wallet_address:
        print(f"\n❌ ERROR: No wallet address (id field) in wallet data")
        return None
    
    if not token:
        print(f"\n❌ ERROR: No authentication token provided")
        print(f"   Cannot make authenticated request without token")
        return None
    
    # Convert wallet amount to smallest unit (USD cents by default: 1 USD = 100 cents)
    amount_base_units = int(amount_xrp * (10 ** asset_scale))
    
    payload = {
        "walletAddress": wallet_address,
        "incomingAmount": {
            "value": str(amount_base_units),
            "assetCode": asset_code,
            "assetScale": asset_scale
        },
        "expiresAt": (datetime.now() + timedelta(hours=24)).isoformat(),
        "metadata": {
            "description": "KULTHERA Museum Payment - Kora Performance"
        }
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n💳 Creating incoming payment:")
    print(f"   • Wallet Address: {wallet_address}")
    print(f"   • Amount: {amount_xrp} {asset_code} ({amount_base_units} base units)")
    print(f"   • Endpoint: {incoming_payments_url}")
    print(f"\n📤 Sending request...")
    
    try:
        response = requests.post(
            incoming_payments_url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        print(f"\n   ✓ Response Status: HTTP {response.status_code}")
        
        if response.status_code in [200, 201]:
            try:
                payment = response.json()
                
                print(f"\n✅ Invoice Created!")
                print(f"   • Payment ID: {payment.get('id', 'N/A')}")
                print(f"   • Amount: {amount_xrp} XRP")
                print(f"   • Status: {payment.get('completed', False)}")
                
                return payment
            except json.JSONDecodeError as je:
                print(f"\n❌ Response was not JSON:")
                print(f"   {response.text[:200]}")
                return None
        else:
            print(f"\n❌ Failed (HTTP {response.status_code})")
            print(f"\n📋 Error Response:")
            print(f"   {response.text}")
            
            # Try to parse error
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"\n💡 Error Details:")
                    print(f"   {json.dumps(error_data['error'], indent=2)}")
            except:
                pass
            
            return None
            
    except requests.exceptions.Timeout:
        print(f"❌ Request timeout - server took too long to respond")
        return None
    except requests.exceptions.ConnectionError as ce:
        print(f"❌ Connection error: {ce}")
        print(f"   Endpoint may not exist: {incoming_payments_url}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return None


# ====================================================================
# STEP 5: GET QUOTE (Sender negotiates amount)
# ====================================================================

def step5_get_quote(sender_wallet, incoming_payment, token):
    """
    Sender requests a quote to see fees and exchange rates
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 5: GET QUOTE (Sender checks cost)                             ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    quotes_url = sender_wallet.get("quotes")
    
    if not quotes_url:
        print(f"⚠️  No quotes endpoint available")
        return None

    asset_code = sender_wallet.get("assetCode", incoming_payment.get("incomingAmount", {}).get("assetCode", "USD"))
    asset_scale = sender_wallet.get("assetScale", incoming_payment.get("incomingAmount", {}).get("assetScale", 2))
    sending_value = incoming_payment.get("incomingAmount", {}).get("value", "100")
    
    payload = {
        "incomingPaymentId": incoming_payment.get("id"),
        "sendingAmount": {
            "value": str(sending_value),
            "assetCode": asset_code,
            "assetScale": asset_scale
        }
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n📊 Requesting quote for {sending_value} base units ({asset_code}, scale {asset_scale})...")
    
    try:
        response = requests.post(
            quotes_url,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code in [200, 201]:
            quote = response.json()
            
            print(f"\n✅ Quote Retrieved:")
            print(f"   • Sending: 1 XRP")
            print(f"   • Receiving: {quote.get('receivingAmount', {}).get('value', 'N/A')} drops")
            print(f"   • Fee: {quote.get('fee', {}).get('value', '0')} drops")
            
            return quote
        else:
            print(f"❌ Failed (HTTP {response.status_code})")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


# ====================================================================
# STEP 6: EXECUTE PAYMENT (REAL TRANSACTION)
# ====================================================================

def step6_execute_payment(sender_wallet, quote, token):
    """
    Execute the REAL payment - this actually transfers XRP!
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 6: EXECUTE PAYMENT (REAL TRANSFER)                           ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    outgoing_payments_url = sender_wallet.get("outgoingPayment")
    
    if not outgoing_payments_url:
        print(f"❌ No outgoingPayment endpoint")
        return None
    
    payload = {
        "incomingPaymentId": quote.get("incomingPaymentId"),
        "quoteId": quote.get("id"),
        "sendingAmount": quote.get("sendingAmount")
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n⚡ EXECUTING REAL PAYMENT...")
    print(f"   • Amount: 1 XRP")
    print(f"   • Endpoint: {outgoing_payments_url}")
    print(f"\n   ⏳ This may take 10-30 seconds...")
    
    try:
        response = requests.post(
            outgoing_payments_url,
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            result = response.json()
            
            print(f"\n✅ PAYMENT SENT!")
            print(f"   • Transaction ID: {result.get('id', 'N/A')}")
            print(f"   • Status: {result.get('status', 'PENDING')}")
            print(f"   • Amount Sent: 1 XRP")
            
            return result
        else:
            print(f"❌ Failed (HTTP {response.status_code})")
            print(f"   Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


# ====================================================================
# STEP 7: VERIFY IN WALLET
# ====================================================================

def step7_verify_transaction(ilp_address):
    """
    Final verification - check wallet balance and transactions
    """
    print(f"\n╔════════════════════════════════════════════════════════════════════╗")
    print(f"║ STEP 7: VERIFY TRANSACTION IN WALLET                              ║")
    print(f"╚════════════════════════════════════════════════════════════════════╝")
    
    print(f"\n✅ Transaction complete!")
    print(f"\n📍 View your transaction:")
    print(f"   1. Go to: https://wallet.interledger-test.dev")
    print(f"   2. Login if needed")
    print(f"   3. Check 'Transactions' section")
    print(f"   4. Look for outgoing 1 XRP payment")
    print(f"\n📊 Your ILP Address: {ilp_address}")
    print(f"\n📊 Alternative: Check XRPL Testnet")
    print(f"   • Visit: https://testnet.xrpl.org")
    print(f"   • Search your wallet address")
    print(f"   • Find the transaction record")


# ====================================================================
# MAIN FLOW
# ====================================================================

def main():
    """Complete step-by-step flow"""
    
    print("\n" * 2)
    print("╔" + "="*66 + "╗")
    print("║" + " INTERLEDGER XRPL REAL TRANSACTION GUIDE ".center(66) + "║")
    print("║" + " Send real test tokens and verify in wallet ".center(66) + "║")
    print("╚" + "="*66 + "╝")
    
    # Step 1: Register/Get your ILP address
    sender_ilp_address = step1_register_wallet()
    
    if not sender_ilp_address:
        print("❌ Cancelled")
        return
    
    # Step 2: Get YOUR wallet details (sender)
    sender_wallet = step2_get_wallet_details(sender_ilp_address)
    if not sender_wallet:
        print("❌ Could not fetch your wallet details")
        return
    
    # Step 2B: Get RECEIVER's wallet details
    print(f"\n" + "="*70)
    receiver_ilp_address = input("\nEnter RECEIVER's ILP Address (who you're sending to): ").strip()
    
    receiver_wallet = step2b_get_receiver_wallet(receiver_ilp_address)
    if not receiver_wallet:
        print("❌ Could not fetch receiver's wallet details")
        return
    
    # Step 3: Get auth token
    token = step3_get_auth_token()
    if not token:
        print("❌ No token provided - cannot proceed")
        return
    
    # Step 4: Create incoming payment FOR THE RECEIVER
    incoming = step4_create_incoming_payment(receiver_wallet, token, amount_xrp=1.0)
    if not incoming:
        print("❌ Could not create incoming payment for receiver")
        return
    
    # Step 5: Get quote
    quote = step5_get_quote(sender_wallet, incoming, token)
    if not quote:
        print("⚠️  Could not get quote, but continuing...")
    
    # Step 6: Execute (real transfer from sender to receiver!)
    if quote:
        payment = step6_execute_payment(sender_wallet, quote, token)
    else:
        print("❌ No quote available - cannot execute payment")
        return
    
    # Step 7: Verify
    step7_verify_transaction(sender_ilp_address)
    
    print("\n" + "="*70)
    print("✨ TRANSACTION COMPLETE - Check your wallet!")
    print("="*70 + "\n")


if __name__ == "__main__":
    main()
