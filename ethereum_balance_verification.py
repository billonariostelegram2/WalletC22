#!/usr/bin/env python3
"""
ETHEREUM BALANCE VERIFICATION - CRITICAL DIAGNOSIS
Testing with public APIs and known addresses to verify our testing methodology
"""

import requests
import json
import sys
from datetime import datetime

# Test addresses
USER_ADDRESS = "0xFD2Ef3afe76b5546f4fe0fc55A7fBb08fe11E76b"  # User's address
KNOWN_RICH_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"  # Vitalik's address (known to have ETH)

def wei_to_eth(wei_value):
    """Convert Wei to ETH"""
    try:
        if isinstance(wei_value, str):
            if wei_value.startswith('0x'):
                wei_value = wei_value[2:]
            wei_int = int(wei_value, 16)
        else:
            wei_int = int(wei_value)
        
        eth_value = wei_int / (10**18)
        return eth_value
    except Exception as e:
        print(f"❌ Error converting Wei to ETH: {e}")
        return 0

def test_public_rpc_apis(address, description):
    """Test with public RPC APIs that don't require authentication"""
    print(f"\n{'='*80}")
    print(f"🔍 TESTING {description}")
    print(f"📍 Address: {address}")
    print(f"{'='*80}")
    
    # Public APIs that should work without authentication
    public_apis = [
        {
            "name": "Ethereum Mainnet (Public)",
            "url": "https://eth-mainnet.public.blastapi.io",
            "requires_auth": False
        },
        {
            "name": "Ethereum Mainnet (Cloudflare)",
            "url": "https://cloudflare-eth.com",
            "requires_auth": False
        },
        {
            "name": "Ethereum Mainnet (1RPC)",
            "url": "https://1rpc.io/eth",
            "requires_auth": False
        }
    ]
    
    results = []
    
    for api in public_apis:
        print(f"\n🔍 Testing: {api['name']}")
        print(f"📡 URL: {api['url']}")
        
        try:
            payload = {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "eth_getBalance",
                "params": [address, "latest"]
            }
            
            headers = {"Content-Type": "application/json"}
            
            response = requests.post(api['url'], json=payload, headers=headers, timeout=30)
            
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"📊 Response: {json.dumps(data, indent=2)}")
                    
                    if "result" in data:
                        balance_wei = data["result"]
                        balance_eth = wei_to_eth(balance_wei)
                        
                        print(f"✅ SUCCESS:")
                        print(f"   💰 Balance (Wei): {balance_wei}")
                        print(f"   💰 Balance (ETH): {balance_eth:.9f}")
                        
                        results.append({
                            "api": api['name'],
                            "success": True,
                            "balance": balance_eth,
                            "balance_wei": balance_wei
                        })
                        
                        if balance_eth > 0:
                            print(f"   🎉 BALANCE DETECTED: {balance_eth:.9f} ETH")
                        else:
                            print(f"   ⚠️ ZERO BALANCE")
                            
                    elif "error" in data:
                        print(f"❌ API ERROR: {data['error']}")
                        results.append({
                            "api": api['name'],
                            "success": False,
                            "error": data['error']
                        })
                    else:
                        print(f"❌ UNEXPECTED RESPONSE FORMAT")
                        results.append({
                            "api": api['name'],
                            "success": False,
                            "error": "Unexpected response format"
                        })
                        
                except json.JSONDecodeError:
                    print(f"❌ INVALID JSON: {response.text}")
                    results.append({
                        "api": api['name'],
                        "success": False,
                        "error": "Invalid JSON response"
                    })
            else:
                print(f"❌ HTTP ERROR {response.status_code}: {response.text}")
                results.append({
                    "api": api['name'],
                    "success": False,
                    "error": f"HTTP {response.status_code}"
                })
                
        except requests.exceptions.Timeout:
            print(f"❌ TIMEOUT")
            results.append({
                "api": api['name'],
                "success": False,
                "error": "Timeout"
            })
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
            results.append({
                "api": api['name'],
                "success": False,
                "error": str(e)
            })
    
    return results

def test_etherscan_without_key(address, description):
    """Test Etherscan without API key (limited but should work)"""
    print(f"\n🔍 Testing Etherscan (No API Key) for {description}")
    
    try:
        url = "https://api.etherscan.io/api"
        params = {
            "module": "account",
            "action": "balance",
            "address": address,
            "tag": "latest"
            # No API key - should still work with rate limits
        }
        
        response = requests.get(url, params=params, timeout=30)
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            if data.get("status") == "1" and "result" in data:
                balance_wei = data["result"]
                balance_eth = wei_to_eth(balance_wei)
                
                print(f"✅ ETHERSCAN SUCCESS:")
                print(f"   💰 Balance (ETH): {balance_eth:.9f}")
                
                return True, balance_eth
            else:
                print(f"❌ ETHERSCAN ERROR: {data}")
                return False, 0
        else:
            print(f"❌ HTTP ERROR: {response.status_code}")
            return False, 0
            
    except Exception as e:
        print(f"❌ ETHERSCAN ERROR: {str(e)}")
        return False, 0

def main():
    """Main verification function"""
    print("🚨 ETHEREUM BALANCE VERIFICATION - CRITICAL DIAGNOSIS")
    print(f"Test Time: {datetime.now()}")
    
    # Test 1: Known rich address (should have balance)
    print(f"\n{'='*80}")
    print("🎯 STEP 1: TESTING WITH KNOWN RICH ADDRESS (VITALIK)")
    print("This should show balance if our testing method works")
    print(f"{'='*80}")
    
    rich_results = test_public_rpc_apis(KNOWN_RICH_ADDRESS, "KNOWN RICH ADDRESS (Vitalik)")
    rich_etherscan_success, rich_etherscan_balance = test_etherscan_without_key(KNOWN_RICH_ADDRESS, "KNOWN RICH ADDRESS")
    
    # Test 2: User's address
    print(f"\n{'='*80}")
    print("🎯 STEP 2: TESTING USER'S ADDRESS")
    print("This is the problematic address")
    print(f"{'='*80}")
    
    user_results = test_public_rpc_apis(USER_ADDRESS, "USER'S ADDRESS")
    user_etherscan_success, user_etherscan_balance = test_etherscan_without_key(USER_ADDRESS, "USER'S ADDRESS")
    
    # Analysis
    print(f"\n{'='*80}")
    print("🚨 CRITICAL ANALYSIS")
    print(f"{'='*80}")
    
    # Check if any API worked with rich address
    rich_working_apis = [r for r in rich_results if r.get('success') and r.get('balance', 0) > 0]
    user_working_apis = [r for r in user_results if r.get('success')]
    
    print(f"\n📊 RICH ADDRESS RESULTS:")
    if rich_working_apis:
        print(f"   ✅ {len(rich_working_apis)} APIs detected balance for rich address")
        for api in rich_working_apis:
            print(f"      - {api['api']}: {api['balance']:.6f} ETH")
        print(f"   🎉 OUR TESTING METHOD WORKS!")
    else:
        print(f"   ❌ NO APIs detected balance for rich address")
        print(f"   🚨 OUR TESTING METHOD MAY BE BROKEN!")
    
    if rich_etherscan_success and rich_etherscan_balance > 0:
        print(f"   ✅ Etherscan detected balance: {rich_etherscan_balance:.6f} ETH")
    
    print(f"\n📊 USER ADDRESS RESULTS:")
    user_has_balance = False
    for api in user_results:
        if api.get('success'):
            balance = api.get('balance', 0)
            status = "✅ HAS BALANCE" if balance > 0 else "⚠️ ZERO BALANCE"
            print(f"   {api['api']}: {status} - {balance:.9f} ETH")
            if balance > 0:
                user_has_balance = True
        else:
            print(f"   {api['api']}: ❌ FAILED - {api.get('error', 'Unknown error')}")
    
    if user_etherscan_success:
        print(f"   Etherscan: {'✅ HAS BALANCE' if user_etherscan_balance > 0 else '⚠️ ZERO BALANCE'} - {user_etherscan_balance:.9f} ETH")
        if user_etherscan_balance > 0:
            user_has_balance = True
    
    print(f"\n🎯 FINAL DIAGNOSIS:")
    
    if rich_working_apis:
        print(f"   ✅ Testing method is VALID (rich address shows balance)")
        
        if user_has_balance:
            print(f"   ✅ USER'S ADDRESS HAS BALANCE!")
            print(f"   🎉 PROBLEM SOLVED: APIs can detect user's balance")
            print(f"   🛠️ SOLUTION: Use working APIs in application")
        else:
            print(f"   ❌ USER'S ADDRESS SHOWS ZERO BALANCE")
            print(f"   🔍 POSSIBLE CAUSES:")
            print(f"      1. User's funds might be on different network (BSC, Polygon, etc.)")
            print(f"      2. Address might be incorrect")
            print(f"      3. Funds might be in tokens, not ETH")
            print(f"      4. Recent transaction not yet confirmed")
            
            print(f"\n🛠️ RECOMMENDED ACTIONS:")
            print(f"   1. Verify user is checking Ethereum mainnet (not testnet)")
            print(f"   2. Check if funds are ERC-20 tokens instead of ETH")
            print(f"   3. Verify the address is copied correctly")
            print(f"   4. Check transaction history on Etherscan")
    else:
        print(f"   ❌ Testing method has issues (rich address shows no balance)")
        print(f"   🚨 API connectivity or authentication problems")
        print(f"   🛠️ Need to fix API access first")
    
    return user_has_balance

if __name__ == "__main__":
    main()