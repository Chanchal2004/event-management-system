from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

import os
import uuid
import jwt
import io
import json
import base64
import logging
import qrcode
import aiofiles

from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

# ================= INIT =================
ROOT_DIR = Path(__file__).parent
load_dotenv()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ================= ENV =================
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET", "secret")

if not MONGO_URL or not DB_NAME:
    raise Exception("❌ Missing ENV")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ================= CORS =================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================= SECURITY =================
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ================= HELPERS =================
def hash_password(p): return pwd_context.hash(p[:72])
def verify_password(p, h): return pwd_context.verify(p[:72], h)

def create_token(user):
    return jwt.encode({
        "id": user["id"],
        "email": user["email"],
        "exp": datetime.utcnow() + timedelta(hours=24)
    }, JWT_SECRET, algorithm="HS256")

async def get_current_user(c: HTTPAuthorizationCredentials = Depends(security)):
    payload = jwt.decode(c.credentials, JWT_SECRET, algorithms=["HS256"])
    user = await db.users.find_one({"id": payload["id"]})
    if not user:
        raise HTTPException(401, "User not found")
    return user

def generate_qr(data):
    qr = qrcode.make(data)
    buf = io.BytesIO()
    qr.save(buf)
    return base64.b64encode(buf.getvalue()).decode()

# ================= MODELS =================
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class Login(BaseModel):
    email: EmailStr
    password: str

class Event(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    max_participants: int

# ================= AUTH =================
@api_router.post("/auth/register")
async def register(user: UserCreate):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(400, "Email exists")

    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "name": user.name,
        "password": hash_password(user.password)
    }

    await db.users.insert_one(new_user)

    return {
        "token": create_token(new_user),
        "user": new_user
    }

@api_router.post("/auth/login")
async def login(data: Login):
    user = await db.users.find_one({"email": data.email})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(401, "Invalid creds")

    return {
        "token": create_token(user),
        "user": user
    }

# ================= EVENTS =================
@api_router.post("/events")
async def create_event(event: Event, user=Depends(get_current_user)):
    ev = event.dict()
    ev["id"] = str(uuid.uuid4())
    ev["participants"] = 0
    await db.events.insert_one(ev)
    return ev

@api_router.get("/events")
async def get_events():
    return await db.events.find({}, {"_id": 0}).to_list(100)

# ================= REGISTER =================
@api_router.post("/events/{id}/register")
async def register_event(id: str, user=Depends(get_current_user)):
    event = await db.events.find_one({"id": id})
    if not event:
        raise HTTPException(404, "Not found")

    qr = generate_qr(id + user["id"])

    reg = {
        "id": str(uuid.uuid4()),
        "event_id": id,
        "user_id": user["id"],
        "qr": qr
    }

    await db.registrations.insert_one(reg)
    await db.events.update_one({"id": id}, {"$inc": {"participants": 1}})

    return reg

# ================= UPLOAD =================
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@api_router.post("/upload")
async def upload(file: UploadFile = File(...)):
    path = UPLOAD_DIR / file.filename
    async with aiofiles.open(path, "wb") as f:
        await f.write(await file.read())
    return {"url": f"/api/uploads/{file.filename}"}

app.mount("/api/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ================= ROOT =================
@app.get("/")
def root():
    return {"status": "Backend running 🚀"}

# ================= ROUTER =================
app.include_router(api_router)

# ================= SHUTDOWN =================
@app.on_event("shutdown")
async def shutdown():
    client.close()
