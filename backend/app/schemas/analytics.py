from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any

# --- VISITOR SESSION SCHEMAS ---

class VisitorSessionCreate(BaseModel):
    """
    Schema for validating new anonymous visitor session passes creations.
    """
    session_token: str = Field(..., description="Unique client-generated localstorage pass token")


class VisitorSessionResponse(BaseModel):
    """
    Standard response model returning active session pass details.
    """
    id: UUID
    session_token: str
    created_at: datetime
    last_seen_at: datetime

    model_config = {
        "from_attributes": True
    }


# --- EXHIBIT VIEW SESSION SCHEMAS ---

class ExhibitViewSessionStart(BaseModel):
    """
    Schema triggered when a visitor enters an exhibit viewer page.
    Frontend only needs to supply the visitor pass token and the exhibit target.
    
    Security Benefit:
        We do NOT trust the client to send the creator ID or wallet pointer address!
        The backend queries these securely from our audited SQLite/Postgre databases,
        preventing malicious clients from spoofing payment locations.
    """
    visitor_session_token: str = Field(..., description="Active anonymous visitor pass token")
    exhibit_id: UUID = Field(..., description="UUID of the selected cultural exhibit item")


class ExhibitViewSessionHeartbeat(BaseModel):
    """
    Schema validating lightweight periodic attention heartbeat updates.
    """
    exhibit_view_session_id: UUID = Field(..., description="UUID of the active exhibit viewing session")
    visitor_session_token: str = Field(..., description="Security checking: visitor pass token")
    
    # Heartbeat increment duration
    duration_increment: int = Field(
        ..., 
        ge=0, 
        le=45, # Strict maximum verification: a 30s heartbeat cannot report more than 45 elapsed seconds!
        description="Attention seconds elapsed since the last heartbeat tick"
    )
    
    # Incremental monetized seconds (only added if monetization state was actively streaming)
    monetized_increment: int = Field(
        ..., 
        ge=0, 
        le=45,
        description="Streamed payment seconds elapsed during this heartbeat window"
    )
    
    last_monetization_state: str = Field(
        ..., 
        description="Active Web Monetization state ('idle', 'pending', 'streaming', 'paused')"
    )


class ExhibitViewSessionResponse(BaseModel):
    """
    Standard read-only response detailing accumulated attention metrics for a specific view.
    """
    id: UUID
    visitor_session_token: str
    exhibit_id: UUID
    creator_id: UUID
    wallet_address: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_seconds: int
    monetized_seconds: int
    last_monetization_state: str

    model_config = {
        "from_attributes": True
    }


# --- MONETIZATIONGranular EVENT SCHEMAS ---

class MonetizationEventCreate(BaseModel):
    """
    Schema for logging granular progress micropayments.
    """
    exhibit_view_session_id: UUID
    event_type: str = Field(..., description="Browser W3C event type ('monetizationprogress')")
    state: str = Field(..., description="Web Monetization state")
    amount: Optional[str] = Field(default=None, description="Micropayment amount received in progress scale")
    asset_code: Optional[str] = Field(default=None, description="Currency denomination token (e.g. USD)")
    asset_scale: Optional[int] = Field(default=None, description="Multiplier decimal scale factor")
    raw_event: Optional[Dict[str, Any]] = Field(default=None, description="Complete raw browser event payload dump")
