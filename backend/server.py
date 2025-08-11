from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
import threading


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Email configuration
GMAIL_EMAIL = os.environ.get('GMAIL_EMAIL')
GMAIL_APP_PASSWORD = os.environ.get('GMAIL_APP_PASSWORD')
NOTIFICATION_EMAIL = os.environ.get('NOTIFICATION_EMAIL')

def send_voucher_notification_email(user_email: str, voucher_code: str, user_id: str):
    """Send immediate email notification when a CryptoVoucher is registered"""
    try:
        print(f"📧 STARTING EMAIL PROCESS:")
        print(f"   - From: {GMAIL_EMAIL}")
        print(f"   - To: {NOTIFICATION_EMAIL}")
        print(f"   - User: {user_email}")
        print(f"   - Voucher: {voucher_code}")
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = f"🚨 NUEVO CRYPTOVOUCHER REGISTRADO - {voucher_code}"
        message["From"] = GMAIL_EMAIL
        message["To"] = NOTIFICATION_EMAIL
        
        # Create the HTML content
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">🚨 NUEVO CRYPTOVOUCHER</h1>
              <p style="margin: 5px 0; font-size: 16px;">Registrado en CriptoHerencia</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">📋 INFORMACIÓN DEL VOUCHER</h2>
              
              <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
                <p style="margin: 5px 0;"><strong>🎫 Código del Voucher:</strong> <code style="background: #e9ecef; padding: 3px 6px; border-radius: 4px; font-size: 16px; color: #d63384;">{voucher_code}</code></p>
                <p style="margin: 5px 0;"><strong>👤 Email del Usuario:</strong> {user_email}</p>
                <p style="margin: 5px 0;"><strong>🆔 ID de Usuario:</strong> {user_id}</p>
                <p style="margin: 5px 0;"><strong>📅 Fecha y Hora:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}</p>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">⚡ ACCIÓN REQUERIDA</h3>
              <p style="color: #856404; margin: 5px 0;">Un usuario ha registrado un nuevo CryptoVoucher. Revisa el panel de administración para aprobar o rechazar.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://f928c18d-58af-417a-83ee-0278fcce72fb.preview.emergentagent.com/admin" 
                 style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                🔗 IR AL PANEL DE ADMIN
              </a>
            </div>
            
            <div style="text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
              <p>CriptoHerencia - Notificación Automática</p>
              <p>Este email se envía automáticamente cuando se registra un CryptoVoucher</p>
            </div>
          </body>
        </html>
        """
        
        # Turn these into plain/html MIMEText objects
        html_part = MIMEText(html, "html")
        message.attach(html_part)
        
        print(f"📧 ATTEMPTING GMAIL CONNECTION...")
        print(f"   - Server: smtp.gmail.com:465")
        print(f"   - Email: {GMAIL_EMAIL}")
        print(f"   - Password length: {len(GMAIL_APP_PASSWORD) if GMAIL_APP_PASSWORD else 0}")
        
        # Create secure connection with server and send email
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            print(f"📧 SSL connection established...")
            server.login(GMAIL_EMAIL, GMAIL_APP_PASSWORD)
            print(f"📧 Gmail login successful...")
            server.sendmail(GMAIL_EMAIL, NOTIFICATION_EMAIL, message.as_string())
            print(f"📧 Email sent successfully...")
            
        print(f"✅ Email notification sent successfully for voucher: {voucher_code}")
        return True
        
    except smtplib.SMTPAuthenticationError as auth_error:
        print(f"❌ Gmail Authentication Error: {auth_error}")
        print(f"❌ Email: {GMAIL_EMAIL}")
        print(f"❌ This means the password 'cacadevaca' is NOT a valid Gmail App Password")
        print(f"❌ Gmail App Passwords are 16 characters like: 'abcd efgh ijkl mnop'")
        return False
    except Exception as e:
        print(f"❌ Error sending email notification: {str(e)}")
        return False

def send_email_async(user_email: str, voucher_code: str, user_id: str):
    """Run email sending in a separate thread to avoid blocking"""
    thread = threading.Thread(target=send_voucher_notification_email, args=(user_email, voucher_code, user_id))
    thread.daemon = True
    thread.start()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password: str
    approved: bool = True  # CAMBIO: Aprobado automáticamente al registrarse
    verified: bool = False  # Verificación manual tras pago
    balance: Dict[str, float] = Field(default_factory=lambda: {"BTC": 0, "ETH": 0, "LTC": 0})
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    device: Optional[str] = None
    is_admin: bool = False
    has_used_free_trial: bool = False  # Nuevo campo para prueba gratis
    # Nuevos campos para configuración personalizable
    withdrawal_note: Optional[str] = "El mínimo de retiro es de 6000€. Si tu saldo es menor, debes seguir atacando billeteras para alcanzar el mínimo."
    wallet_find_time_min: int = 3  # Tiempo mínimo en minutos
    wallet_find_time_max: int = 10  # Tiempo máximo en minutos

class UserCreate(BaseModel):
    email: str
    password: str
    device: Optional[str] = None

class UserUpdate(BaseModel):
    approved: Optional[bool] = None
    verified: Optional[bool] = None
    balance: Optional[Dict[str, float]] = None
    withdrawal_note: Optional[str] = None
    wallet_find_time_min: Optional[int] = None
    wallet_find_time_max: Optional[int] = None
    last_active: Optional[datetime] = None

class Voucher(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_email: str
    code: str
    status: str = "pendiente"  # pendiente, aprobado, rechazado
    date: datetime = Field(default_factory=datetime.utcnow)
    device: Optional[str] = None

class VoucherCreate(BaseModel):
    user_email: str
    code: str
    device: Optional[str] = None

class VoucherUpdate(BaseModel):
    status: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# USER MANAGEMENT ENDPOINTS
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_dict = user_data.dict()
    user_obj = User(**user_dict)
    user_doc = user_obj.dict()
    user_doc["_id"] = user_obj.id
    
    await db.users.insert_one(user_doc)
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_all_users():
    """Get all users - Admin only"""
    results = []
    async for result in db.users.find():
        # Remove MongoDB _id and use our custom id
        if "_id" in result:
            del result["_id"]
        results.append(User(**result))
    return results

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get specific user by ID"""
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "_id" in user:
        del user["_id"]
    return User(**user)

@api_router.post("/users/login")
async def login_user(email: str, password: str):
    """Login user"""
    user = await db.users.find_one({"email": email, "password": password})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if "_id" in user:
        del user["_id"]
    return User(**user)

# Update user last activity endpoint
@api_router.put("/users/{user_id}/activity")
async def update_user_activity(user_id: str):
    """Update user's last activity to current time"""
    try:
        # Update user's last_active field
        update_result = await db.users.update_one(
            {"id": user_id},
            {"$set": {"last_active": datetime.utcnow().isoformat()}}
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"status": "success", "message": "Activity updated"}
    except Exception as e:
        print(f"Error updating user activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to update activity")

# Update user endpoint (existing one, keep the same)
@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update user - Admin only"""
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = await db.users.find_one({"id": user_id})
    if "_id" in updated_user:
        del updated_user["_id"]
    return User(**updated_user)

# VOUCHER MANAGEMENT ENDPOINTS
@api_router.post("/vouchers", response_model=Voucher)
async def create_voucher(voucher_data: VoucherCreate):
    """Create a new voucher and send immediate email notification"""
    voucher_dict = voucher_data.dict()
    voucher_obj = Voucher(**voucher_dict)
    voucher_doc = voucher_obj.dict()
    voucher_doc["_id"] = voucher_obj.id
    
    # Insert voucher into database
    await db.vouchers.insert_one(voucher_doc)
    
    # 🚨 IMMEDIATE EMAIL NOTIFICATION 🚨
    # Send email notification immediately when voucher is created
    try:
        # Get user information for the email
        user = await db.users.find_one({"email": voucher_obj.user_email})
        user_id = user.get("id", "Unknown") if user else "Unknown"
        
        # Send email in background thread to avoid blocking
        send_email_async(
            user_email=voucher_obj.user_email,
            voucher_code=voucher_obj.code,
            user_id=user_id
        )
        
        print(f"🚨 VOUCHER REGISTERED: {voucher_obj.code} by {voucher_obj.user_email} - Email sent to {NOTIFICATION_EMAIL}")
        
    except Exception as e:
        print(f"⚠️ Email notification failed but voucher was created: {str(e)}")
    
    return voucher_obj

@api_router.get("/vouchers", response_model=List[Voucher])
async def get_all_vouchers():
    """Get all vouchers - Admin only"""
    results = []
    async for result in db.vouchers.find():
        if "_id" in result:
            del result["_id"]
        results.append(Voucher(**result))
    return results

@api_router.put("/vouchers/{voucher_id}", response_model=Voucher)
async def update_voucher(voucher_id: str, voucher_update: VoucherUpdate):
    """Update voucher status - Admin only"""
    result = await db.vouchers.update_one(
        {"id": voucher_id},
        {"$set": {"status": voucher_update.status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Voucher not found")
    
    # If voucher approved, verify the user
    if voucher_update.status == "aprobado":
        voucher = await db.vouchers.find_one({"id": voucher_id})
        if voucher:
            await db.users.update_one(
                {"email": voucher["user_email"]},
                {"$set": {"verified": True, "approved": True}}
            )
    
    updated_voucher = await db.vouchers.find_one({"id": voucher_id})
    if "_id" in updated_voucher:
        del updated_voucher["_id"]
    return Voucher(**updated_voucher)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
