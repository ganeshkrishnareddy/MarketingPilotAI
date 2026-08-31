import os
from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MarketingPilot AI API",
    description="Backend API for automated digital marketing SaaS platform",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "https://marketingpilot.ai",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        # Fallback for local dev without strict Supabase enforcement yet
        return None 
    return create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"message": "Welcome to MarketingPilot AI API"}

# --- WORKSPACE MODULE ---

# Mock DB in memory for local testing if Supabase is not fully seeded
MOCK_DB = {
    "business": None,
    "brand_kit": None,
    "competitors": []
}

class BusinessProfile(BaseModel):
    name: str
    industry: str
    website_url: str
    target_audience: str
    location: str
    monthly_budget: str

@app.get("/api/v1/workspace/business")
def get_business_profile(supabase: Client = Depends(get_supabase)):
    if MOCK_DB["business"] is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return MOCK_DB["business"]

@app.post("/api/v1/workspace/business")
def save_business_profile(data: BusinessProfile, supabase: Client = Depends(get_supabase)):
    MOCK_DB["business"] = data.dict()
    return {"status": "success", "data": MOCK_DB["business"]}

class BrandKit(BaseModel):
    primary_color: str
    secondary_color: str
    typography: str
    tone_of_voice: str

@app.get("/api/v1/workspace/brand-kit")
def get_brand_kit(supabase: Client = Depends(get_supabase)):
    if MOCK_DB["brand_kit"] is None:
        raise HTTPException(status_code=404, detail="Brand kit not found")
    return MOCK_DB["brand_kit"]

@app.post("/api/v1/workspace/brand-kit")
def save_brand_kit(data: BrandKit, supabase: Client = Depends(get_supabase)):
    MOCK_DB["brand_kit"] = data.dict()
    return {"status": "success", "data": MOCK_DB["brand_kit"]}

class Competitor(BaseModel):
    url: str

@app.get("/api/v1/workspace/competitors")
def get_competitors(supabase: Client = Depends(get_supabase)):
    return MOCK_DB["competitors"]

@app.post("/api/v1/workspace/competitors")
def add_competitor(data: Competitor, supabase: Client = Depends(get_supabase)):
    # Fake scrape/analysis logic
    new_comp = {
        "id": len(MOCK_DB["competitors"]) + 1,
        "url": data.url,
        "name": data.url.replace("https://", "").replace("www.", "").split(".")[0].capitalize(),
        "last_scanned": "2024-10-01T12:00:00Z"
    }
    MOCK_DB["competitors"].append(new_comp)
    return {"status": "success", "data": new_comp}

# --- AI STUDIO MODULE ---
from services.ai import get_ai_provider
from services.ai.prompts import (
    CONTENT_GENERATOR_SYSTEM_PROMPT,
    build_content_generation_prompt,
    CHAT_SYSTEM_PROMPT
)

class ContentGenerationRequest(BaseModel):
    topic: str
    content_type: str
    tone: str
    audience: str

@app.post("/api/v1/ai/generate-content")
def generate_content(request: ContentGenerationRequest):
    try:
        provider = get_ai_provider()
        prompt = build_content_generation_prompt(
            topic=request.topic,
            content_type=request.content_type,
            tone=request.tone,
            audience=request.audience
        )
        
        content = provider.generate_text(
            prompt=prompt,
            system_prompt=CONTENT_GENERATOR_SYSTEM_PROMPT,
            max_tokens=2000
        )
        return {"status": "success", "data": {"content": content}}
    except Exception as e:
        print(f"AI Generation Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@app.post("/api/v1/ai/chat")
def chat(request: ChatRequest):
    try:
        provider = get_ai_provider()
        
        # Inject system prompt at the beginning
        api_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
        for msg in request.messages:
            api_messages.append({"role": msg.role, "content": msg.content})
            
        content = provider.generate_chat(
            messages=api_messages,
            max_tokens=1500
        )
        return {"status": "success", "data": {"content": content}}
    except Exception as e:
        print(f"AI Chat Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


