import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Exhibit(Base):
    """
    SQLAlchemy database model for a Digital Cultural Exhibit.
    
    Analogy:
        Think of an 'Exhibit' as an individual piece of art or performance inside a museum room.
        It is associated with a specific Room wing, a Creator custodian, and contains media assets 
        (music, painting WebP images, rotating artifacts, written essays).
    """
    __tablename__ = "exhibits"

    # Unique Identifier
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Wing Connection (Foreign Key)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    
    # Artist Connection (Foreign Key)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("creators.id", ondelete="CASCADE"), nullable=False)
    
    # Exhibition Title (e.g., 'Sahel Ochres Study')
    title = Column(String, nullable=False)
    
    # Story-style descriptive copy explaining the artistic expression
    description = Column(String, nullable=False)
    
    # Cultural/Historical narrative Context (the 'Kultr' emphasis)
    cultural_context = Column(String, nullable=False)
    
    # Media classification ('audio', 'painting', 'artifact', 'story')
    # Helps the frontend select the correct custom visual/audio secure component
    media_type = Column(String, nullable=False)
    
    # Location of the secure asset media file
    media_url = Column(String, nullable=False)
    
    # Smaller, blurred thumbnail preview location for progressive low-bandwidth rendering
    preview_url = Column(String, nullable=False)
    
    # Redundant payment pointer cache
    # Stored directly on the exhibit to enable instant client DOM swaps without doing model relations lookups first
    wallet_address = Column(String, nullable=False)
    
    # Geographical markers
    country = Column(String, nullable=False)
    region = Column(String, nullable=False)
    
    # Dialect and translation index (e.g., 'yo', 'sw', 'en')
    language_code = Column(String, nullable=False)
    
    # Array list of tags for categorical indexing and search
    # Standard JSON is fully supported by both SQLite and modern PostgreSQL databases
    tags = Column(JSON, default=list, nullable=False)
    
    # Sorting sequence order within the wing view
    display_order = Column(Integer, default=0, nullable=False)
    
    # Audit stamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # 🔗 ORM Relationships
    # These establish dynamic bindings that make fetching parent objects incredibly easy for developers:
    # E.g., `my_exhibit.creator.name` will automatically load creator data behind the scenes.
    room = relationship("Room", backref="exhibits")
    creator = relationship("Creator", backref="exhibits")
