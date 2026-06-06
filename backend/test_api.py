#!/usr/bin/env python
"""
Quick backend API tester
Tests all critical endpoints after auth implementation
"""

import requests
import json

BASE_URL = "https://my-backend-1-s57s.onrender.com/api"

print("=" * 60)
print("🧪 KULTR Backend API Test Suite")
print("=" * 60)

# Test 1: Health Check
print("\n1️⃣  Testing /api/health...")
try:
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Response: {response.json()}")
    else:
        print(f"   ❌ Unexpected status: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: CORS Preflight (OPTIONS)
print("\n2️⃣  Testing CORS preflight OPTIONS /api/auth/signup...")
try:
    response = requests.options(
        f"{BASE_URL}/auth/signup",
        headers={
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ CORS preflight successful")
    else:
        print(f"   ❌ CORS preflight failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Login Endpoint
print("\n3️⃣  Testing POST /api/auth/login...")
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "demo@kultr.com",
            "password": "demo123456"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Login successful")
        print(f"      Token: {data['access_token'][:20]}...")
        print(f"      User: {data['user']['name']}")
    else:
        print(f"   ❌ Response: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Get Current User
print("\n4️⃣  Testing GET /api/auth/me...")
try:
    response = requests.get(
        f"{BASE_URL}/auth/me",
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Retrieved user: {data['name']} ({data['email']})")
    else:
        print(f"   ❌ Response: {response.text}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 5: Exhibits Endpoint
print("\n5️⃣  Testing GET /api/exhibits?page=1&limit=20...")
try:
    response = requests.get(
        f"{BASE_URL}/exhibits?page=1&limit=20",
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Got exhibits list")
        print(f"      Total: {len(data) if isinstance(data, list) else 'N/A'}")
    elif response.status_code == 307:
        print(f"   ⚠️  Got 307 redirect - endpoint needs query param update")
    else:
        print(f"   ❌ Response: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("✅ Test suite complete!")
print("=" * 60)
