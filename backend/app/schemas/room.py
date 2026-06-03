from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class RoomBase(BaseModel):
    """
    Base Pydantic schema for Room attributes.
    Defines the shared data blueprint for both request validation and response models.
    """
    slug: str = Field(..., description="URL-friendly string identifier (e.g. 'sound-roots')")
    name: str = Field(..., description="Display name of the exhibition wing")
    tagline: str = Field(..., description="Short evocative tagline celebrating the room theme")
    description: str = Field(..., description="Deep descriptive narrative context of the wing")
    image_url: str = Field(..., description="Relative path location of the backdrop photo cover")
    display_order: int = Field(default=0, description="Sorting sequence priority in the Lobby view")


class RoomCreate(RoomBase):
    """
    Schema used for validating data when creating a new Room.
    (Currently handled via database seeds, but structured for future Admin portals).
    """
    pass


class RoomResponse(RoomBase):
    """
    Standard read-only response model for Room data.
    Hydrates data returned to our Vercel frontend client.
    """
    id: UUID = Field(..., description="Unique database UUID identifier")
    created_at: datetime
    updated_at: datetime

    # Configure Pydantic to read standard ORM objects dynamically
    # E.g., translates SQLAlchemy Room model properties into JSON responses
    model_config = {
        "from_attributes": True
    }
