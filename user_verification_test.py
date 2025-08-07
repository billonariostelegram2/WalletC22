#!/usr/bin/env python3
"""
VERIFICACIÓN URGENTE DEL ESTADO DE USUARIOS RECIÉN REGISTRADOS
Test específico para documentar exactamente qué valores tienen los usuarios al registrarse
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://f928c18d-58af-417a-83ee-0278fcce72fb.preview.emergentagent.com/api"

def print_section(title):
    print(f"\n{'='*80}")
    print(f"🔍 {title}")
    print(f"{'='*80}")

def print_detailed_response(response, description="Response"):
    print(f"\n📋 {description}:")
    print(f"   Status Code: {response.status_code}")
    try:
        response_json = response.json()
        print(f"   Response Body:")
        print(json.dumps(response_json, indent=6, default=str))
        return response_json
    except:
        print(f"   Response Text: {response.text}")
        return None

def create_verification_user():
    """Crear usuario específico para verificación"""
    print_section("PASO 1: CREAR USUARIO NUEVO")
    
    user_data = {
        "email": "test_verificacion@test.com",
        "password": "test123"
    }
    
    print(f"📤 Enviando POST /api/users con datos:")
    print(json.dumps(user_data, indent=4))
    
    try:
        response = requests.post(f"{BACKEND_URL}/users", json=user_data)
        user = print_detailed_response(response, "POST /api/users Response")
        
        if response.status_code == 200 and user:
            print(f"\n✅ USUARIO CREADO EXITOSAMENTE")
            print(f"📊 VALORES EXACTOS DEL USUARIO RECIÉN CREADO:")
            print(f"   - ID: {user.get('id', 'N/A')}")
            print(f"   - Email: {user.get('email', 'N/A')}")
            print(f"   - APPROVED: {user.get('approved', 'N/A')} (tipo: {type(user.get('approved', 'N/A'))})")
            print(f"   - VERIFIED: {user.get('verified', 'N/A')} (tipo: {type(user.get('verified', 'N/A'))})")
            print(f"   - Is Admin: {user.get('is_admin', 'N/A')}")
            print(f"   - Balance: {user.get('balance', 'N/A')}")
            print(f"   - Created At: {user.get('created_at', 'N/A')}")
            
            return user
        elif response.status_code == 400:
            print(f"⚠️ USUARIO YA EXISTE - Intentando obtener usuario existente")
            return get_existing_user("test_verificacion@test.com")
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ EXCEPCIÓN: {str(e)}")
        return None

def get_existing_user(email):
    """Obtener usuario existente por email"""
    try:
        response = requests.get(f"{BACKEND_URL}/users")
        if response.status_code == 200:
            users = response.json()
            for user in users:
                if user.get('email') == email:
                    print(f"✅ USUARIO EXISTENTE ENCONTRADO:")
                    print(f"📊 VALORES EXACTOS DEL USUARIO EXISTENTE:")
                    print(f"   - ID: {user.get('id', 'N/A')}")
                    print(f"   - Email: {user.get('email', 'N/A')}")
                    print(f"   - APPROVED: {user.get('approved', 'N/A')} (tipo: {type(user.get('approved', 'N/A'))})")
                    print(f"   - VERIFIED: {user.get('verified', 'N/A')} (tipo: {type(user.get('verified', 'N/A'))})")
                    print(f"   - Is Admin: {user.get('is_admin', 'N/A')}")
                    print(f"   - Balance: {user.get('balance', 'N/A')}")
                    return user
        return None
    except:
        return None

def verify_user_after_creation(user_id):
    """Consultar el usuario después de crearlo"""
    print_section("PASO 2: CONSULTAR USUARIO DESPUÉS DE CREACIÓN")
    
    print(f"📤 Enviando GET /api/users/{user_id}")
    
    try:
        response = requests.get(f"{BACKEND_URL}/users/{user_id}")
        user = print_detailed_response(response, f"GET /api/users/{user_id} Response")
        
        if response.status_code == 200 and user:
            print(f"\n✅ USUARIO CONSULTADO EXITOSAMENTE")
            print(f"📊 CONFIRMACIÓN DE VALORES:")
            print(f"   - APPROVED: {user.get('approved', 'N/A')} (tipo: {type(user.get('approved', 'N/A'))})")
            print(f"   - VERIFIED: {user.get('verified', 'N/A')} (tipo: {type(user.get('verified', 'N/A'))})")
            
            # Verificar si los valores son los esperados
            approved = user.get('approved', False)
            verified = user.get('verified', False)
            
            if approved is True and verified is False:
                print(f"\n✅ VALORES CONFIRMADOS CORRECTOS:")
                print(f"   - approved: true ✅")
                print(f"   - verified: false ✅")
                print(f"\n🎯 COMPORTAMIENTO ESPERADO PARA ESTE USUARIO:")
                print(f"   - Debería ver sección 'VERIFICACIÓN REQUERIDA' ✅")
                print(f"   - Debería ver sección 'ACTIVAR EL PROGRAMA' ✅")
                print(f"   - Simulador debería estar BLOQUEADO con mensaje 'ACCESO BLOQUEADO' ✅")
            else:
                print(f"\n⚠️ VALORES INESPERADOS:")
                print(f"   - approved: {approved} (esperado: true)")
                print(f"   - verified: {verified} (esperado: false)")
            
            return user
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ EXCEPCIÓN: {str(e)}")
        return None

def check_all_users_status():
    """Verificar estado de todos los usuarios"""
    print_section("PASO 3: VERIFICAR TODOS LOS USUARIOS")
    
    try:
        response = requests.get(f"{BACKEND_URL}/users")
        users = print_detailed_response(response, "GET /api/users Response")
        
        if response.status_code == 200 and users:
            print(f"\n📊 ANÁLISIS DE TODOS LOS USUARIOS ({len(users)} total):")
            
            for i, user in enumerate(users, 1):
                email = user.get('email', 'N/A')
                approved = user.get('approved', 'N/A')
                verified = user.get('verified', 'N/A')
                is_admin = user.get('is_admin', False)
                
                print(f"\n   Usuario {i}: {email}")
                print(f"      - approved: {approved} (tipo: {type(approved)})")
                print(f"      - verified: {verified} (tipo: {type(verified)})")
                print(f"      - is_admin: {is_admin}")
                
                # Determinar comportamiento esperado
                if approved is True and verified is False and not is_admin:
                    print(f"      - 🎯 DEBERÍA VER: Interfaz bloqueada con 'ACCESO BLOQUEADO'")
                elif approved is True and verified is True and not is_admin:
                    print(f"      - 🎯 DEBERÍA VER: Simulador desbloqueado")
                elif is_admin:
                    print(f"      - 🎯 ADMIN: Acceso completo")
                else:
                    print(f"      - 🎯 ESTADO INUSUAL: approved={approved}, verified={verified}")
            
            return users
        else:
            print(f"❌ ERROR: Status {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ EXCEPCIÓN: {str(e)}")
        return None

def main():
    """Función principal de verificación"""
    print("🚀 VERIFICACIÓN URGENTE DEL ESTADO DE USUARIOS RECIÉN REGISTRADOS")
    print(f"🌐 Backend URL: {BACKEND_URL}")
    print(f"⏰ Hora de prueba: {datetime.now()}")
    
    # Paso 1: Crear usuario nuevo
    user = create_verification_user()
    if not user:
        print("❌ CRÍTICO: No se pudo crear o encontrar el usuario de prueba")
        return
    
    user_id = user.get('id')
    if not user_id:
        print("❌ CRÍTICO: Usuario sin ID válido")
        return
    
    # Paso 2: Consultar usuario después
    verified_user = verify_user_after_creation(user_id)
    if not verified_user:
        print("❌ CRÍTICO: No se pudo verificar el usuario después de creación")
        return
    
    # Paso 3: Verificar todos los usuarios
    all_users = check_all_users_status()
    
    # Resumen final
    print_section("RESUMEN FINAL")
    
    approved = verified_user.get('approved', 'N/A')
    verified = verified_user.get('verified', 'N/A')
    
    print(f"📋 USUARIO DE PRUEBA: test_verificacion@test.com")
    print(f"   - approved: {approved}")
    print(f"   - verified: {verified}")
    
    if approved is True and verified is False:
        print(f"\n✅ CONCLUSIÓN: Usuario tiene valores correctos")
        print(f"🎯 COMPORTAMIENTO ESPERADO:")
        print(f"   - Debe ver secciones 'VERIFICACIÓN REQUERIDA' y 'ACTIVAR EL PROGRAMA'")
        print(f"   - Simulador debe estar BLOQUEADO con mensaje 'ACCESO BLOQUEADO'")
        print(f"\n⚠️ SI EL USUARIO NO VE LA INTERFAZ BLOQUEADA:")
        print(f"   - El problema está en el FRONTEND, no en el backend")
        print(f"   - La lógica de verificación en React no está funcionando correctamente")
        print(f"   - Revisar UserDashboard.js para la lógica de bloqueo")
    else:
        print(f"\n❌ PROBLEMA DETECTADO: Valores incorrectos en backend")
        print(f"   - approved debería ser true, es: {approved}")
        print(f"   - verified debería ser false, es: {verified}")
    
    print(f"\n{'='*80}")
    print("🏁 VERIFICACIÓN COMPLETADA")
    print(f"{'='*80}")

if __name__ == "__main__":
    main()