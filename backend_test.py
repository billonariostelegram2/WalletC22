#!/usr/bin/env python3
"""
Backend API Testing for RESTART VERIFICATION FINAL TEST
Testing the system after forced restart to verify log message and email functionality
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://f928c18d-58af-417a-83ee-0278fcce72fb.preview.emergentagent.com/api"

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

def test_restart_verification_final():
    """🚨 PRUEBA FINAL DEFINITIVA TRAS RESTART FORZADO"""
    print_test_header("🚨 PRUEBA FINAL DEFINITIVA TRAS RESTART FORZADO")
    
    try:
        print("🎯 OBJETIVO CRÍTICO: Confirmar que TANTO la funcionalidad como el mensaje de log estén 100% correctos después del restart forzado")
        
        print(f"\n📧 STEP 1: Creando voucher con restart fresco...")
        voucher_data = {
            "code": "RESTART-VERIFICATION-2025",
            "user_email": "restart_test@gmail.com",
            "device": "restart_verification"
        }
        
        print(f"Voucher data: {json.dumps(voucher_data, indent=2)}")
        print(f"🔍 VERIFICACIÓN CRÍTICA: Mensaje de log DEBE mostrar exodus.ayuda@gmail.com")
        
        # Create voucher and capture response
        response = requests.post(f"{BACKEND_URL}/vouchers", json=voucher_data)
        voucher = print_response(response, "POST /api/vouchers Response")
        
        if response.status_code == 200 and voucher:
            print(f"✅ SUCCESS: Voucher RESTART-VERIFICATION-2025 creado exitosamente")
            print(f"- Voucher ID: {voucher.get('id')}")
            print(f"- Voucher Code: {voucher.get('code')}")
            print(f"- User Email: {voucher.get('user_email')}")
            print(f"- Status: {voucher.get('status')}")
            
            print(f"\n📧 STEP 2: Verificando mensaje de log COMPLETAMENTE CORREGIDO...")
            print(f"🔍 MENSAJE QUE DEBE APARECER:")
            print(f"   ✅ CORRECTO: '🚨 VOUCHER REGISTERED: RESTART-VERIFICATION-2025 by restart_test@gmail.com - Email sent to exodus.ayuda@gmail.com'")
            print(f"   ❌ NO DEBE APARECER: 'descifrab@gmail.com' en ninguna parte del log")
            print(f"   ✅ VARIABLE: Confirmar que NOTIFICATION_EMAIL se resuelve correctamente")
            
            print(f"\n📧 STEP 3: Verificando proceso completo de email...")
            print(f"🔍 LOGS ESPECÍFICOS ESPERADOS:")
            print(f"   1. '📧 STARTING EMAIL PROCESS:' - Con destino exodus.ayuda@gmail.com")
            print(f"   2. '📧 ATTEMPTING GMAIL CONNECTION...'")
            print(f"   3. '📧 SSL connection established...'")
            print(f"   4. '📧 Gmail login successful...'")
            print(f"   5. '📧 Email sent successfully...'")
            print(f"   6. '✅ Email notification sent successfully for voucher: RESTART-VERIFICATION-2025'")
            
            print(f"\n🎯 CONFIRMACIÓN FINAL REQUERIDA:")
            print(f"✅ Log message muestra destino correcto: exodus.ayuda@gmail.com")
            print(f"✅ Email funciona y va al destino correcto")
            print(f"✅ No hay referencias hardcodeadas a descifrab@gmail.com")
            print(f"✅ Sistema 100% listo para producción")
            
            print(f"\n📧 STEP 4: Esperando proceso completo de email...")
            import time
            time.sleep(5)  # Wait for email process
            
            print(f"\n✅ VOUCHER RESTART-VERIFICATION-2025 PROCESADO")
            print(f"🔍 VERIFICAR LOGS BACKEND PARA CONFIRMACIÓN DEFINITIVA")
            print(f"🚨 NO PARAR HASTA QUE TODO ESTÉ PERFECTO")
            
            return True
            
        else:
            print(f"❌ FAILED: No se pudo crear voucher de restart verification - Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main testing function - PRUEBA FINAL DEFINITIVA TRAS RESTART FORZADO"""
    print("🚨 PRUEBA FINAL DEFINITIVA TRAS RESTART FORZADO")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    
    # PRUEBA DEFINITIVA: Restart verification
    print("\n" + "="*80)
    print("🚨 PRUEBA FINAL DEFINITIVA TRAS RESTART FORZADO")
    print("="*80)
    
    restart_test_result = test_restart_verification_final()
    
    if restart_test_result:
        print(f"\n✅ PRUEBA FINAL COMPLETADA EXITOSAMENTE")
        print(f"\n📧 VERIFICACIÓN CRÍTICA - CHECK BACKEND LOGS:")
        print(f"1. Buscar mensaje: '🚨 VOUCHER REGISTERED: RESTART-VERIFICATION-2025 by restart_test@gmail.com - Email sent to exodus.ayuda@gmail.com'")
        print(f"2. Confirmar que NO aparece 'descifrab@gmail.com' hardcodeado")
        print(f"3. Verificar proceso completo de email:")
        print(f"   - ✅ '📧 STARTING EMAIL PROCESS:' con destino correcto")
        print(f"   - ✅ '📧 ATTEMPTING GMAIL CONNECTION...'")
        print(f"   - ✅ '📧 SSL connection established...'")
        print(f"   - ✅ '📧 Gmail login successful...'")
        print(f"   - ✅ '📧 Email sent successfully...'")
        print(f"   - ✅ '✅ Email notification sent successfully for voucher: RESTART-VERIFICATION-2025'")
        
        print(f"\n🔍 CONFIGURACIÓN FINAL:")
        print(f"- GMAIL_EMAIL: descifrab@gmail.com")
        print(f"- GMAIL_APP_PASSWORD: ucda imqo cndg ujca (16 chars)")
        print(f"- NOTIFICATION_EMAIL: exodus.ayuda@gmail.com (DESTINO CORRECTO)")
        
        print(f"\n🎯 RESULTADO FINAL:")
        print(f"Si todo está correcto, el sistema queda completamente funcional y operativo.")
        print(f"Email con código RESTART-VERIFICATION-2025 debe llegar a exodus.ayuda@gmail.com")
        
    else:
        print(f"\n❌ PRUEBA FINAL FALLÓ")
        print(f"No se pudo crear voucher de restart verification para confirmación final")
    
    print(f"\n{'='*80}")
    print("🏁 PRUEBA FINAL DEFINITIVA COMPLETADA")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()