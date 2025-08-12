#!/usr/bin/env python3
"""
ETHEREUM BALANCE API TESTING - CRITICAL ISSUE
Testing all 4 Ethereum balance APIs to diagnose why user's real funds (0.0009 ETH) are not being detected

User Address: 0xFD2Ef3afe76b5546f4fe0fc55A7fBb08fe11E76b
Expected Balance: ~0.0009 ETH (user confirmed real funds in Trust Wallet)

APIs to test:
1. Cloudflare ETH: https://cloudflare-eth.com
2. Etherscan público: https://api.etherscan.io/api
3. Quicknode: https://frequent-broken-putty.quiknode.pro/6c187f5e5d4cedf07dd28b96fde65b3af649ae74/
4. Ankr: https://rpc.ankr.com/eth
"""

import requests
import json
import sys
from datetime import datetime

# Test address with confirmed funds
TEST_ADDRESS = "0xFD2Ef3afe76b5546f4fe0fc55A7fBb08fe11E76b"
EXPECTED_BALANCE_ETH = 0.0009  # User confirmed balance

# API endpoints
APIS = {
    "Cloudflare ETH": "https://cloudflare-eth.com",
    "Etherscan": "https://api.etherscan.io/api",
    "Quicknode": "https://frequent-broken-putty.quiknode.pro/6c187f5e5d4cedf07dd28b96fde65b3af649ae74/",
    "Ankr": "https://rpc.ankr.com/eth"
}

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"🚨 CRITICAL TEST: {test_name}")
    print(f"{'='*80}")

def wei_to_eth(wei_value):
    """Convert Wei to ETH"""
    try:
        if isinstance(wei_value, str):
            # Remove '0x' prefix if present
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

def test_json_rpc_api(api_name, api_url):
    """Test JSON-RPC eth_getBalance method"""
    print_test_header(f"{api_name} - JSON-RPC eth_getBalance")
    
    try:
        # JSON-RPC payload
        payload = {
            "id": 1,
            "jsonrpc": "2.0",
            "method": "eth_getBalance",
            "params": [TEST_ADDRESS, "latest"]
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"🔍 Testing API: {api_name}")
        print(f"📡 URL: {api_url}")
        print(f"👤 Address: {TEST_ADDRESS}")
        print(f"📦 Payload: {json.dumps(payload, indent=2)}")
        
        # Make request
        response = requests.post(api_url, json=payload, headers=headers, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print(f"📊 Response Body: {json.dumps(response_data, indent=2)}")
                
                if "result" in response_data:
                    balance_wei = response_data["result"]
                    balance_eth = wei_to_eth(balance_wei)
                    
                    print(f"\n✅ SUCCESS - Balance Retrieved:")
                    print(f"   💰 Balance (Wei): {balance_wei}")
                    print(f"   💰 Balance (ETH): {balance_eth:.9f}")
                    print(f"   🎯 Expected: ~{EXPECTED_BALANCE_ETH} ETH")
                    
                    if balance_eth > 0:
                        print(f"   ✅ BALANCE DETECTED: {balance_eth:.9f} ETH")
                        if balance_eth >= EXPECTED_BALANCE_ETH * 0.8:  # Allow 20% variance
                            print(f"   🎉 BALANCE MATCHES EXPECTED RANGE!")
                            return True, balance_eth
                        else:
                            print(f"   ⚠️ BALANCE LOWER THAN EXPECTED")
                            return True, balance_eth
                    else:
                        print(f"   ❌ ZERO BALANCE DETECTED - THIS IS THE PROBLEM!")
                        return False, 0
                        
                elif "error" in response_data:
                    print(f"❌ API ERROR: {response_data['error']}")
                    return False, 0
                else:
                    print(f"❌ UNEXPECTED RESPONSE FORMAT")
                    return False, 0
                    
            except json.JSONDecodeError:
                print(f"❌ INVALID JSON RESPONSE: {response.text}")
                return False, 0
        else:
            print(f"❌ HTTP ERROR {response.status_code}: {response.text}")
            return False, 0
            
    except requests.exceptions.Timeout:
        print(f"❌ TIMEOUT ERROR: API took too long to respond")
        return False, 0
    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR: Could not connect to API")
        return False, 0
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        return False, 0

def test_etherscan_api():
    """Test Etherscan API with specific parameters"""
    print_test_header("Etherscan API - Specific Test")
    
    try:
        # Etherscan specific endpoint
        url = "https://api.etherscan.io/api"
        params = {
            "module": "account",
            "action": "balance",
            "address": TEST_ADDRESS,
            "tag": "latest",
            "apikey": "YourApiKeyToken"  # Free tier
        }
        
        print(f"🔍 Testing Etherscan API")
        print(f"📡 URL: {url}")
        print(f"👤 Address: {TEST_ADDRESS}")
        print(f"📦 Params: {json.dumps(params, indent=2)}")
        
        response = requests.get(url, params=params, timeout=30)
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                print(f"📊 Response Body: {json.dumps(response_data, indent=2)}")
                
                if response_data.get("status") == "1" and "result" in response_data:
                    balance_wei = response_data["result"]
                    balance_eth = wei_to_eth(balance_wei)
                    
                    print(f"\n✅ SUCCESS - Etherscan Balance Retrieved:")
                    print(f"   💰 Balance (Wei): {balance_wei}")
                    print(f"   💰 Balance (ETH): {balance_eth:.9f}")
                    
                    if balance_eth > 0:
                        print(f"   ✅ ETHERSCAN DETECTS BALANCE: {balance_eth:.9f} ETH")
                        return True, balance_eth
                    else:
                        print(f"   ❌ ETHERSCAN SHOWS ZERO BALANCE")
                        return False, 0
                else:
                    print(f"❌ ETHERSCAN ERROR: {response_data}")
                    return False, 0
                    
            except json.JSONDecodeError:
                print(f"❌ INVALID JSON RESPONSE: {response.text}")
                return False, 0
        else:
            print(f"❌ HTTP ERROR {response.status_code}: {response.text}")
            return False, 0
            
    except Exception as e:
        print(f"❌ ETHERSCAN ERROR: {str(e)}")
        return False, 0

def main():
    """Main testing function for Ethereum balance APIs"""
    print("🚨 ETHEREUM BALANCE API TESTING - CRITICAL ISSUE")
    print(f"Test Time: {datetime.now()}")
    print(f"User Address: {TEST_ADDRESS}")
    print(f"Expected Balance: ~{EXPECTED_BALANCE_ETH} ETH")
    print(f"Problem: Application shows 0.000000 ETH but user has real funds")
    
    results = {}
    working_apis = []
    
    # Test each JSON-RPC API
    for api_name, api_url in APIS.items():
        if api_name == "Etherscan":
            # Test Etherscan with specific method
            success, balance = test_etherscan_api()
        else:
            # Test with JSON-RPC
            success, balance = test_json_rpc_api(api_name, api_url)
        
        results[api_name] = {
            "success": success,
            "balance": balance
        }
        
        if success and balance > 0:
            working_apis.append(api_name)
    
    # Summary
    print(f"\n{'='*80}")
    print("🚨 CRITICAL TESTING SUMMARY")
    print(f"{'='*80}")
    
    print(f"\n📊 API TEST RESULTS:")
    for api_name, result in results.items():
        status = "✅ WORKING" if result["success"] and result["balance"] > 0 else "❌ FAILED"
        balance_str = f"{result['balance']:.9f} ETH" if result["balance"] > 0 else "0.000000 ETH"
        print(f"   {api_name}: {status} - Balance: {balance_str}")
    
    print(f"\n🎯 CRITICAL FINDINGS:")
    if working_apis:
        print(f"   ✅ WORKING APIs: {', '.join(working_apis)}")
        print(f"   🎉 AT LEAST ONE API DETECTS BALANCE!")
        
        # Find the API with highest balance
        best_api = max(results.items(), key=lambda x: x[1]["balance"])
        print(f"   🏆 BEST API: {best_api[0]} with {best_api[1]['balance']:.9f} ETH")
        
    else:
        print(f"   ❌ NO APIs DETECTED BALANCE!")
        print(f"   🚨 THIS IS THE ROOT CAUSE OF THE PROBLEM!")
        
    print(f"\n🔍 DIAGNOSIS:")
    if not working_apis:
        print(f"   ❌ CRITICAL ISSUE: All APIs return 0 balance")
        print(f"   🔍 Possible causes:")
        print(f"      1. Address format issue")
        print(f"      2. Network connectivity problems")
        print(f"      3. API rate limiting or authentication")
        print(f"      4. Incorrect API endpoints")
        print(f"      5. User's funds might be on different network")
        
        print(f"\n🛠️ RECOMMENDED ACTIONS:")
        print(f"   1. Verify the address is correct: {TEST_ADDRESS}")
        print(f"   2. Check if funds are on Ethereum mainnet vs testnet")
        print(f"   3. Test with a known address with balance")
        print(f"   4. Check API authentication requirements")
        print(f"   5. Implement fallback API rotation")
        
    else:
        print(f"   ✅ GOOD NEWS: {len(working_apis)} API(s) detect balance")
        print(f"   🛠️ SOLUTION: Use working API(s) in application")
        print(f"   📝 Update application to use: {working_apis[0]}")
    
    print(f"\n🚨 USER IMPACT:")
    print(f"   👤 User has real funds: ~{EXPECTED_BALANCE_ETH} ETH")
    print(f"   💔 Application shows: 0.000000 ETH")
    print(f"   🚫 User cannot send funds due to zero balance detection")
    
    if working_apis:
        print(f"\n✅ SOLUTION AVAILABLE:")
        print(f"   🔧 Switch to working API: {working_apis[0]}")
        print(f"   🎯 Expected result: User will see correct balance")
        return True
    else:
        print(f"\n❌ CRITICAL PROBLEM:")
        print(f"   🚨 No APIs detect balance - needs immediate investigation")
        print(f"   🔍 Manual verification required")
        return False

if __name__ == "__main__":
    main()