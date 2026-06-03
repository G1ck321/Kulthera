#!/usr/bin/env python
"""
Quick test to verify OPTIONS requests work
"""

import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("🧪 Testing CORS & Auth Routes")
print("=" * 60)

# Test OPTIONS /api/auth/signup
print("\n1️⃣  Testing OPTIONS /api/auth/signup...")
try:
    response = requests.options(
        f"{BASE_URL}/api/auth/signup",
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    print(f"   Headers: {dict(response.headers)}")
    if response.status_code == 200:
        print(f"   ✅ OPTIONS works!")
    else:
        print(f"   ❌ Unexpected: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test POST /api/auth/login
print("\n2️⃣  Testing POST /api/auth/login...")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "demo@kultr.com",
            "password": "demo123456"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Login works!")
        print(f"      Token: {data['access_token'][:30]}...")
    else:
        print(f"   ❌ Response: {response.text[:100]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test /api/health
print("\n3️⃣  Testing GET /api/health...")
try:
    response = requests.get(f"{BASE_URL}/api/health", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Health check works!")
    else:
        print(f"   ❌ Response: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ Verification complete!")
print("=" * 60)
