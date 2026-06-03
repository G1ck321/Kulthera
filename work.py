from open_payments_sdk.client.client import OpenPaymentsClient
from open_payments_sdk.api.resource import IncomingPayments, OutgoingPayments, Quotes

# 1. You must load a private key that you generated
# with open("privkey.pem", "r", encoding="utf_8") as privkey:
#     private_key = privkey.read()

# 2. Initialize the official client
op_client = OpenPaymentsClient(
    client_wallet_address="https://ilp.interledger-test.dev/boluwatife",
    keyid="c3832efe-c5f5-4150-9e07-d623f3ff4535", 
    private_key="MC4CAQAwBQYDK2VwBCIEIE41OfpaNIVug5rU6p1odJwHX5hmJ2HTgV7LUjKHgeMp"
)

# 3. Create the incoming payment (The SDK handles all the complex signature math!)
incoming_payment = IncomingPayments(
    keyid="c3832efe-c5f5-4150-9e07-d623f3ff4535",   
    
    private_key="MC4CAQAwBQYDK2VwBCIEIE41OfpaNIVug5rU6p1odJwHX5hmJ2HTgV7LUjKHgeMp"
)