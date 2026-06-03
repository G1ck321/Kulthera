import uuid
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Room(Base):
    """
    SQLAlchemy database model for a Museum Room.
    
    Analogy:
        Think of a 'Room' as a themed physical wing of our museum (e.g., 'Sound Roots' or 'Painted Memory').
        It serves as a collection container that groups individual cultural Exhibits together.
    """
    __tablename__ = "rooms"

    # Primary Unique Identifier
    # We use UUIDs rather than standard serial integers to secure object references 
    # and simplify future multi-region database syncing.
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # URL-friendly identifier (e.g., 'sound-roots')
    slug = Column(String, unique=True, index=True, nullable=False)
    
    # Beautiful display name (e.g., 'Sound Roots')
    name = Column(String, nullable=False)
    
    # A short, emotional tagline (e.g., 'Rhythms that shaped a continent')
    tagline = Column(String, nullable=False)
    
    # Comprehensive historical and structural description
    description = Column(String, nullable=False)
    
    # High-quality visual representation background cover
    image_url = Column(String, nullable=False)
    
    # Order index determining room placement priority in the Lobby view
    display_order = Column(Integer, default=0, nullable=False)
    
    # Metadata timestamps for auditing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
