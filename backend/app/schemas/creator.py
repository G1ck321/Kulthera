from pydantic import BaseModel, Field, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional

class CreatorBase(BaseModel):
    """
    Base Pydantic schema for Creator attributes.
    """
    name: str = Field(..., description="Full professional name of the cultural custodian")
    role: str = Field(..., description="Artistic role or archival title (e.g. Master Drummer)")
    bio: str = Field(..., description="Generous biographical background storytelling narrative")
    avatar_url: str = Field(..., description="Visual profile picture URL location")
    wallet_address: str = Field(..., description="Sovereign Interledger Wallet Pointer address")
    country: str = Field(..., description="Geographical country of practice origin")
    language: str = Field(..., description="Original dialect or spoken tongue")
    email: Optional[EmailStr] = Field(default=None, description="Private email for platform correspondence")


class CreatorCreate(CreatorBase):
    """
    Schema for validating new Creator registration requests.
    """
    pass


class CreatorResponse(CreatorBase):
    """
    Standard read-only response model for Creator data returned to client dashboards.
    """
    id: UUID = Field(..., description="Unique database UUID identifier")
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
