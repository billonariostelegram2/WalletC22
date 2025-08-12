#!/usr/bin/env python3
"""
ETHEREUM ADDRESS INVESTIGATION - DEEP DIVE
Investigating the user's address to find where the funds actually are
"""

import requests
import json
from datetime import datetime

USER_ADDRESS = "0xFD2Ef3afe76b5546f4fe0fc55A7fBb08fe11E76b"

def check_address_on_different_networks():
    """Check the same address on different networks"""
    print(f"\n{'='*80}")
    print("🔍 CHECKING ADDRESS ON DIFFERENT NETWORKS")
    print(f"{'='*80}")
    
    networks = [
        {
            "name": "Ethereum Mainnet",
            "rpc": "https://eth-mainnet.public.blastapi.io",
            "explorer": "https://etherscan.io"
        },
        {
            "name": "Binance Smart Chain",
            "rpc": "https://bsc-dataseed.binance.org",
            "explorer": "https://bscscan.com"
        },
        {
            "name": "Polygon",
            "rpc": "https://polygon-rpc.com",
            "explorer": "https://polygonscan.com"
        }
    ]
    
    results = {}
    
    for network in networks:
        print(f"\n🔍 Checking {network['name']}...")
        
        try:
            payload = {
                "id": 1,
                "jsonrpc": "2.0",
                "method": "eth_getBalance",
                "params": [USER_ADDRESS, "latest"]
            }
            
            response = requests.post(network['rpc'], json=payload, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if "result" in data:
                    balance_wei = data["result"]
                    balance_eth = int(balance_wei, 16) / (10**18) if balance_wei != "0x0" else 0
                    
                    print(f"   💰 Balance: {balance_eth:.9f} {'ETH' if network['name'] == 'Ethereum Mainnet' else 'native token'}")
                    print(f"   🔗 Explorer: {network['explorer']}/address/{USER_ADDRESS}")
                    
                    results[network['name']] = {
                        "balance": balance_eth,
                        "explorer": f"{network['explorer']}/address/{USER_ADDRESS}"
                    }
                    
                    if balance_eth > 0:
                        print(f"   🎉 BALANCE FOUND ON {network['name'].upper()}!")
                else:
                    print(f"   ❌ Error: {data.get('error', 'Unknown error')}")
                    results[network['name']] = {"error": data.get('error', 'Unknown error')}
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                results[network['name']] = {"error": f"HTTP {response.status_code}"}
                
        except Exception as e:
            print(f"   ❌ Exception: {str(e)}")
            results[network['name']] = {"error": str(e)}
    
    return results

def check_etherscan_with_free_api():
    """Try to get transaction history from Etherscan"""
    print(f"\n{'='*80}")
    print("🔍 CHECKING ETHERSCAN TRANSACTION HISTORY")
    print(f"{'='*80}")
    
    # Try without API key first (limited requests)
    try:
        print(f"🔍 Checking transaction history...")
        
        # Get normal transactions
        url = "https://api.etherscan.io/api"
        params = {
            "module": "account",
            "action": "txlist",
            "address": USER_ADDRESS,
            "startblock": 0,
            "endblock": 99999999,
            "page": 1,
            "offset": 10,
            "sort": "desc"
        }
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Response: {json.dumps(data, indent=2)}")
            
            if data.get("status") == "1" and "result" in data:
                transactions = data["result"]
                print(f"✅ Found {len(transactions)} transactions")
                
                for i, tx in enumerate(transactions[:5]):  # Show first 5
                    value_eth = int(tx["value"]) / (10**18) if tx["value"] != "0" else 0
                    print(f"   TX {i+1}: {value_eth:.6f} ETH - Hash: {tx['hash']}")
                    
                return True, transactions
            else:
                print(f"❌ Etherscan error: {data}")
                return False, []
        else:
            print(f"❌ HTTP error: {response.status_code}")
            return False, []
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False, []

def check_token_balances():
    """Check if the address has ERC-20 token balances"""
    print(f"\n{'='*80}")
    print("🔍 CHECKING FOR ERC-20 TOKEN BALANCES")
    print(f"{'='*80}")
    
    # Common stablecoins and tokens
    common_tokens = [
        {
            "name": "USDT",
            "contract": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            "decimals": 6
        },
        {
            "name": "USDC",
            "contract": "0xA0b86a33E6441b8e8C7C7b0b2C4C2e4b4b4b4b4b",
            "decimals": 6
        }
    ]
    
    print("🔍 Checking common ERC-20 tokens...")
    print("Note: This requires specific token contract calls")
    print("Recommendation: Check manually on Etherscan for token balances")
    print(f"🔗 Direct link: https://etherscan.io/address/{USER_ADDRESS}#tokentxns")

def main():
    """Main investigation function"""
    print("🚨 ETHEREUM ADDRESS INVESTIGATION - DEEP DIVE")
    print(f"🔍 Address: {USER_ADDRESS}")
    print(f"⏰ Time: {datetime.now()}")
    print(f"🎯 Goal: Find where the user's 0.0009 ETH actually is")
    
    # Check different networks
    network_results = check_address_on_different_networks()
    
    # Check transaction history
    tx_success, transactions = check_etherscan_with_free_api()
    
    # Check for tokens
    check_token_balances()
    
    # Final analysis
    print(f"\n{'='*80}")
    print("🚨 INVESTIGATION SUMMARY")
    print(f"{'='*80}")
    
    print(f"\n📊 NETWORK BALANCE RESULTS:")
    found_balance = False
    for network, result in network_results.items():
        if "balance" in result:
            balance = result["balance"]
            if balance > 0:
                print(f"   ✅ {network}: {balance:.9f} tokens")
                print(f"      🔗 {result['explorer']}")
                found_balance = True
            else:
                print(f"   ⚠️ {network}: 0.000000000 tokens")
        else:
            print(f"   ❌ {network}: {result.get('error', 'Unknown error')}")
    
    print(f"\n🔍 TRANSACTION HISTORY:")
    if tx_success and transactions:
        print(f"   ✅ Found {len(transactions)} transactions")
        print(f"   🔗 View all: https://etherscan.io/address/{USER_ADDRESS}")
    else:
        print(f"   ❌ Could not retrieve transaction history")
        print(f"   🔗 Check manually: https://etherscan.io/address/{USER_ADDRESS}")
    
    print(f"\n🎯 CRITICAL FINDINGS:")
    
    if found_balance:
        print(f"   🎉 BALANCE FOUND on one or more networks!")
        print(f"   🛠️ SOLUTION: Check which network the user is actually using")
    else:
        print(f"   ❌ NO BALANCE found on any tested network")
        print(f"   🔍 POSSIBLE EXPLANATIONS:")
        print(f"      1. Funds are in ERC-20 tokens, not native ETH")
        print(f"      2. User is on a different network (Arbitrum, Optimism, etc.)")
        print(f"      3. Address is incorrect or from different wallet")
        print(f"      4. Funds were recently moved")
    
    print(f"\n🛠️ IMMEDIATE ACTIONS FOR USER:")
    print(f"   1. 🔗 Check Etherscan: https://etherscan.io/address/{USER_ADDRESS}")
    print(f"   2. 📱 Verify address in Trust Wallet matches exactly")
    print(f"   3. 🌐 Confirm which network Trust Wallet is showing")
    print(f"   4. 💰 Check if balance is in tokens, not ETH")
    print(f"   5. 📋 Look at transaction history for recent activity")
    
    print(f"\n🚨 FOR DEVELOPERS:")
    if found_balance:
        print(f"   ✅ Working APIs found: Use these for balance checking")
        print(f"   🔧 Implement multi-network support")
    else:
        print(f"   🔍 Address shows zero balance on Ethereum mainnet")
        print(f"   🛠️ Need to verify user's actual network and token type")
        print(f"   📞 Contact user to confirm wallet details")

if __name__ == "__main__":
    main()