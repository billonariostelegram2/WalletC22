#!/usr/bin/env python3
"""
Backend API Testing for User Verification Issue Diagnosis
Testing critical user verification workflow that's reported as failing
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://0d948033-b026-48de-8f70-7d1741710ba7.preview.emergentagent.com/api"

def print_test_header(test_name):
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

def print_response(response, description="Response"):
    print(f"\n{description}:")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        response_json = response.json()
        print(f"Body: {json.dumps(response_json, indent=2, default=str)}")
        return response_json
    except:
        print(f"Body (text): {response.text}")
        return None

def test_get_users():
    """Test 1: Verify endpoint de usuarios - GET /api/users"""
    print_test_header("GET /api/users - Verificar lista completa de usuarios")
    
    try:
        response = requests.get(f"{BACKEND_URL}/users")
        users = print_response(response, "GET /api/users Response")
        
        if response.status_code == 200 and users:
            print(f"\n✅ SUCCESS: Found {len(users)} users")
            
            # Analyze user verification status
            verified_users = [u for u in users if u.get('verified', False)]
            approved_users = [u for u in users if u.get('approved', False)]
            
            print(f"\nUSER ANALYSIS:")
            print(f"- Total users: {len(users)}")
            print(f"- Verified users: {len(verified_users)}")
            print(f"- Approved users: {len(approved_users)}")
            
            for i, user in enumerate(users):
                print(f"\nUser {i+1}:")
                print(f"  - ID: {user.get('id', 'N/A')}")
                print(f"  - Email: {user.get('email', 'N/A')}")
                print(f"  - Verified: {user.get('verified', False)}")
                print(f"  - Approved: {user.get('approved', False)}")
                print(f"  - Is Admin: {user.get('is_admin', False)}")
            
            return users
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_manual_verification(user_id):
    """Test 2: Probar proceso de verificación manual"""
    print_test_header(f"PUT /api/users/{user_id} - Verificación manual")
    
    try:
        # Test manual verification
        update_data = {"verified": True}
        response = requests.put(f"{BACKEND_URL}/users/{user_id}", json=update_data)
        updated_user = print_response(response, f"PUT /api/users/{user_id} Response")
        
        if response.status_code == 200 and updated_user:
            print(f"\n✅ SUCCESS: User updated")
            print(f"- Verified: {updated_user.get('verified', False)}")
            print(f"- Approved: {updated_user.get('approved', False)}")
            
            # Verify the change persisted by getting user again
            print(f"\n🔍 VERIFICATION: Getting user again to confirm persistence...")
            verify_response = requests.get(f"{BACKEND_URL}/users/{user_id}")
            verify_user = print_response(verify_response, "Verification GET Response")
            
            if verify_response.status_code == 200 and verify_user:
                if verify_user.get('verified', False):
                    print(f"✅ CONFIRMED: User verification persisted in database")
                else:
                    print(f"❌ CRITICAL: User verification NOT persisted in database!")
                return verify_user
            else:
                print(f"❌ FAILED: Could not verify persistence")
                return None
        else:
            print(f"❌ FAILED: Status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_voucher_workflow(user_email):
    """Test 3: Probar proceso completo de voucher"""
    print_test_header("Voucher Workflow - Create and Approve")
    
    try:
        # Step 1: Create voucher
        voucher_data = {
            "user_email": user_email,
            "code": "CRYPTO123TEST",
            "device": "test_device"
        }
        
        print(f"Creating voucher for {user_email}...")
        create_response = requests.post(f"{BACKEND_URL}/vouchers", json=voucher_data)
        voucher = print_response(create_response, "POST /api/vouchers Response")
        
        if create_response.status_code != 200 or not voucher:
            print(f"❌ FAILED: Could not create voucher")
            return None
            
        voucher_id = voucher.get('id')
        print(f"✅ Voucher created with ID: {voucher_id}")
        
        # Step 2: Approve voucher
        print(f"\nApproving voucher {voucher_id}...")
        approve_data = {"status": "aprobado"}
        approve_response = requests.put(f"{BACKEND_URL}/vouchers/{voucher_id}", json=approve_data)
        approved_voucher = print_response(approve_response, "PUT /api/vouchers/{voucher_id} Response")
        
        if approve_response.status_code != 200 or not approved_voucher:
            print(f"❌ FAILED: Could not approve voucher")
            return None
            
        print(f"✅ Voucher approved")
        
        # Step 3: Check if user was automatically verified
        print(f"\n🔍 CHECKING: Did user get automatically verified?")
        users = test_get_users()
        if users:
            target_user = next((u for u in users if u.get('email') == user_email), None)
            if target_user:
                print(f"\nUser status after voucher approval:")
                print(f"- Verified: {target_user.get('verified', False)}")
                print(f"- Approved: {target_user.get('approved', False)}")
                
                if target_user.get('verified', False) and target_user.get('approved', False):
                    print(f"✅ SUCCESS: User automatically verified after voucher approval")
                else:
                    print(f"❌ CRITICAL: User NOT automatically verified after voucher approval!")
                    
                return target_user
            else:
                print(f"❌ ERROR: Could not find user with email {user_email}")
        
        return None
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return None

def test_data_consistency():
    """Test 4: Verificar consistencia de datos"""
    print_test_header("Data Consistency Check")
    
    try:
        # Get all users
        users_response = requests.get(f"{BACKEND_URL}/users")
        if users_response.status_code != 200:
            print(f"❌ FAILED: Could not get users list")
            return False
            
        users = users_response.json()
        print(f"Found {len(users)} users for consistency check")
        
        # Check each user individually
        consistent = True
        for user in users:
            user_id = user.get('id')
            if not user_id:
                continue
                
            # Get individual user
            individual_response = requests.get(f"{BACKEND_URL}/users/{user_id}")
            if individual_response.status_code != 200:
                print(f"❌ INCONSISTENCY: Could not get individual user {user_id}")
                consistent = False
                continue
                
            individual_user = individual_response.json()
            
            # Compare key fields
            list_verified = user.get('verified', False)
            individual_verified = individual_user.get('verified', False)
            list_approved = user.get('approved', False)
            individual_approved = individual_user.get('approved', False)
            
            if list_verified != individual_verified or list_approved != individual_approved:
                print(f"❌ INCONSISTENCY found for user {user.get('email', user_id)}:")
                print(f"  List API - Verified: {list_verified}, Approved: {list_approved}")
                print(f"  Individual API - Verified: {individual_verified}, Approved: {individual_approved}")
                consistent = False
            else:
                print(f"✅ User {user.get('email', user_id)[:20]}... - Consistent")
        
        if consistent:
            print(f"\n✅ SUCCESS: All user data is consistent between endpoints")
        else:
            print(f"\n❌ CRITICAL: Data inconsistencies found!")
            
        return consistent
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main testing function"""
    print("🚀 STARTING BACKEND API TESTING FOR USER VERIFICATION ISSUE")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    
    # Test 1: Get all users
    users = test_get_users()
    if not users:
        print("❌ CRITICAL: Cannot proceed without user data")
        return
    
    # Find a test user (non-admin, preferably not verified)
    test_user = None
    for user in users:
        if not user.get('is_admin', False):
            test_user = user
            break
    
    if not test_user:
        print("❌ No suitable test user found. Creating one...")
        # Create a test user
        try:
            user_data = {
                "email": "testuser@verification.com",
                "password": "testpass123",
                "device": "test_device"
            }
            create_response = requests.post(f"{BACKEND_URL}/users", json=user_data)
            if create_response.status_code == 200:
                test_user = create_response.json()
                print(f"✅ Created test user: {test_user.get('email')}")
            else:
                print(f"❌ Could not create test user: {create_response.status_code}")
                return
        except Exception as e:
            print(f"❌ Error creating test user: {e}")
            return
    
    print(f"\n🎯 Using test user: {test_user.get('email')} (ID: {test_user.get('id')})")
    
    # Test 2: Manual verification
    updated_user = test_manual_verification(test_user.get('id'))
    
    # Test 3: Voucher workflow (use a different user or reset the test user)
    test_voucher_workflow(test_user.get('email'))
    
    # Test 4: Data consistency
    test_data_consistency()
    
    print(f"\n{'='*60}")
    print("🏁 TESTING COMPLETED")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()