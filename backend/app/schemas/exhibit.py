from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.schemas.creator import CreatorResponse

class ExhibitBase(BaseModel):
    """
    Base Pydantic schema for Exhibit attributes.
    """
    title: str = Field(..., description="Exhibition title of the digital work")
    description: str = Field(..., description="Descriptive storytelling copy of the item")
    cultural_context: str = Field(..., description="Generous historical and cultural background context")
    media_type: str = Field(..., description="MediaType categorization ('audio', 'painting', 'artifact', 'story')")
    media_url: str = Field(..., description="Secure path location of the creative asset file")
    preview_url: str = Field(..., description="Low-bandwidth placeholder thumbnail cover")
    wallet_address: str = Field(..., description="Derived Interledger Pointer target address")
    country: str = Field(..., description="Geographical country of cultural origin")
    region: str = Field(..., description="Regional province or city of practice")
    language_code: str = Field(..., description="Original spoken or written language dialect index")
    tags: List[str] = Field(default_list=[], description="Categorical tag words for catalog index searching")
    display_order: int = Field(default=0, description="Sorting sequence value in Room grid views")


class ExhibitCreate(ExhibitBase):
    """
    Schema for validating new digital items creations requests.
    """
    room_id: UUID
    creator_id: UUID


class ExhibitResponse(ExhibitBase):
    """
    Standard read-only response model for Exhibit data.
    """
    id: UUID = Field(..., description="Unique database UUID identifier")
    room_id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime

    # 🔗 Nested ORM Relationship Hydration
    # This automatically hydrates the Creator's profile details inline if requested!
    # A massive help for junior developers making frontend detail cards.
    creator: Optional[CreatorResponse] = None

    model_config = {
        "from_attributes": True
    }
