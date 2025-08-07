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

def test_email_diagnostic_urgent():
    """PRUEBA URGENTE PARA DIAGNOSTICAR PROBLEMA DE EMAIL"""
    print_test_header("🚨 DIAGNÓSTICO URGENTE - PROBLEMA DE EMAIL")
    
    try:
        print("🎯 OBJETIVO: Crear voucher y capturar logs detallados para identificar exactamente por qué no funciona el email")
        
        # 1. Crear voucher de prueba con logs detallados
        print("\n📧 STEP 1: Creating DEBUG voucher with detailed logging...")
        voucher_data = {
            "code": "DEBUG-EMAIL-TEST",
            "user_email": "debug@test.com",
            "device": "test_device"
        }
        
        print(f"Voucher data: {json.dumps(voucher_data, indent=2)}")
        print(f"🔍 MONITORING: Watching for specific email process logs...")
        
        # Create voucher and capture response
        response = requests.post(f"{BACKEND_URL}/vouchers", json=voucher_data)
        voucher = print_response(response, "POST /api/vouchers Response")
        
        if response.status_code == 200 and voucher:
            print(f"✅ SUCCESS: DEBUG voucher created successfully")
            print(f"- Voucher ID: {voucher.get('id')}")
            print(f"- Voucher Code: {voucher.get('code')}")
            print(f"- User Email: {voucher.get('user_email')}")
            print(f"- Status: {voucher.get('status')}")
            
            # 2. Verificar configuración específica
            print(f"\n📧 STEP 2: Verifying exact configuration values...")
            print(f"Expected configuration from backend/.env:")
            print(f"- GMAIL_EMAIL: 'descifrab@gmail.com'")
            print(f"- GMAIL_APP_PASSWORD: 'cacadevaca' (length: 10 chars)")
            print(f"- NOTIFICATION_EMAIL: 'descifrab@gmail.com'")
            print(f"\n⚠️  EXPECTED ISSUE: 'cacadevaca' is NOT a valid Gmail App Password")
            print(f"   Gmail App Passwords must be 16 characters like: 'abcd efgh ijkl mnop'")
            
            # 3. Logs específicos a buscar
            print(f"\n📧 STEP 3: LOGS ESPECÍFICOS A CAPTURAR:")
            print(f"🔍 Buscar en logs los mensajes que empiecen con '📧':")
            print(f"   1. '📧 STARTING EMAIL PROCESS:'")
            print(f"   2. '📧 ATTEMPTING GMAIL CONNECTION...'")
            print(f"   3. '📧 SSL connection established...'")
            print(f"   4. '📧 Gmail login successful...' (o error aquí)")
            print(f"   5. '❌ Gmail Authentication Error:'")
            
            print(f"\n🚨 INFORMACIÓN CRÍTICA ESPERADA:")
            print(f"¿En qué paso exacto falla el email?")
            print(f"- ¿SSL connection? ✓ (debería funcionar)")
            print(f"- ¿Gmail login? ❌ (debería fallar aquí)")
            print(f"- ¿Envío del mensaje? (no llega a este punto)")
            
            print(f"\n📧 STEP 4: Waiting for email process to complete...")
            print(f"⏳ Email process runs in background thread...")
            
            # Wait a moment for the email process to complete
            import time
            time.sleep(3)
            
            print(f"\n✅ VOUCHER CREATION COMPLETED")
            print(f"🔍 NOW CHECK BACKEND LOGS FOR EMAIL DIAGNOSTIC INFO")
            
            return True
            
        else:
            print(f"❌ FAILED: Could not create DEBUG voucher - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_email_notification_system():
    """Test 5: PRUEBA CRÍTICA DEL SISTEMA DE NOTIFICACIONES POR EMAIL"""
    print_test_header("SISTEMA DE NOTIFICACIONES POR EMAIL - CRYPTOVOUCHER")
    
    try:
        # 1. Crear un voucher de prueba con datos específicos
        print("📧 STEP 1: Creating test voucher for email notification...")
        voucher_data = {
            "code": "TEST-EMAIL-2024",
            "user_email": "test@test.com",  # Note: using user_email as per API
            "device": "test_device"
        }
        
        print(f"Voucher data: {json.dumps(voucher_data, indent=2)}")
        
        # Create voucher and capture response
        response = requests.post(f"{BACKEND_URL}/vouchers", json=voucher_data)
        voucher = print_response(response, "POST /api/vouchers Response")
        
        if response.status_code == 200 and voucher:
            print(f"✅ SUCCESS: Voucher created successfully")
            print(f"- Voucher ID: {voucher.get('id')}")
            print(f"- Voucher Code: {voucher.get('code')}")
            print(f"- User Email: {voucher.get('user_email')}")
            print(f"- Status: {voucher.get('status')}")
            
            # 2. Verificar configuración de email
            print(f"\n📧 STEP 2: Checking email configuration...")
            print(f"Expected email configuration:")
            print(f"- GMAIL_EMAIL: descifrab@gmail.com")
            print(f"- GMAIL_APP_PASSWORD: cacadevaca")
            print(f"- NOTIFICATION_EMAIL: descifrab@gmail.com")
            
            # 3. Información para verificar logs
            print(f"\n📧 STEP 3: Email process verification instructions...")
            print(f"🔍 CHECK BACKEND LOGS FOR:")
            print(f"- Message: '🚨 VOUCHER REGISTERED: TEST-EMAIL-2024 by test@test.com - Email sent to descifrab@gmail.com'")
            print(f"- Function execution: send_email_async called")
            print(f"- Email sending: send_voucher_notification_email executed")
            print(f"- Success message: '✅ Email notification sent successfully for voucher: TEST-EMAIL-2024'")
            print(f"- OR Error message: '❌ Error sending email notification: [error details]'")
            
            print(f"\n📧 STEP 4: Checking backend logs now...")
            return True
            
        else:
            print(f"❌ FAILED: Could not create voucher - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main testing function"""
    print("🚨 STARTING URGENT EMAIL DIAGNOSTIC TEST")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    
    # PRUEBA URGENTE: Diagnóstico específico del problema de email
    print("\n" + "="*80)
    print("🚨 PRUEBA URGENTE PARA DIAGNOSTICAR PROBLEMA DE EMAIL")
    print("="*80)
    
    diagnostic_result = test_email_diagnostic_urgent()
    
    if diagnostic_result:
        print(f"\n✅ DIAGNOSTIC TEST COMPLETED")
        print(f"\n📧 NEXT STEPS - CHECK BACKEND LOGS:")
        print(f"1. Look for messages starting with '📧'")
        print(f"2. Identify exact failure point:")
        print(f"   - SSL connection (should work)")
        print(f"   - Gmail login (expected to fail)")
        print(f"   - Message sending (won't reach this)")
        print(f"3. Confirm Authentication Error due to invalid App Password")
        
        print(f"\n🔍 EXPECTED FINDINGS:")
        print(f"- GMAIL_EMAIL: descifrab@gmail.com ✓")
        print(f"- GMAIL_APP_PASSWORD: cacadevaca (10 chars) ❌")
        print(f"- NOTIFICATION_EMAIL: descifrab@gmail.com ✓")
        print(f"- ERROR: Gmail Authentication Error (535 BadCredentials)")
        print(f"- CAUSE: 'cacadevaca' is not a valid 16-character Gmail App Password")
        
    else:
        print(f"\n❌ DIAGNOSTIC TEST FAILED")
        print(f"Could not create test voucher for email diagnosis")
    
    print(f"\n{'='*80}")
    print("🏁 URGENT EMAIL DIAGNOSTIC COMPLETED")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()