from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/crm", tags=["CRM"])

class ContactCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    tags: List[str] = []

@router.get("/contacts")
def list_contacts():
    # TODO: Fetch from Supabase
    return {"status": "success", "data": []}

@router.post("/contacts")
def create_contact(contact: ContactCreate):
    # TODO: Insert into Supabase
    return {"status": "success", "data": contact}

@router.get("/leads")
def list_leads():
    # TODO: Fetch from Supabase
    return {"status": "success", "data": []}
