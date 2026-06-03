import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Creator(Base):
    """
    SQLAlchemy database model for a Creator or Cultural Custodian.
    
    Analogy:
        A 'Creator' represents the human artist, community, or custodian who owns the exhibit.
        They are the central focus of our payment standard—all micropayments streamed during 
        active exhibit views will route directly to their sovereign wallet address pointer.
    """
    __tablename__ = "creators"

    # Unique Identifier
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Creator's full professional name (e.g., 'Amaka Okoro')
    name = Column(String, nullable=False)
    
    # Artistic or historical role (e.g., 'Master Drummer', 'Contemporary Painter')
    role = Column(String, nullable=False)
    
    # Deep, storytelling-style biographical background
    bio = Column(String, nullable=False)
    
    # Profile avatar representation photo URL
    avatar_url = Column(String, nullable=False)
    
    # Interledger Open Payments Address Pointer
    # E.g., '$ilp.interledger-test.dev/amaka_okoro'
    # This is the vital address where our browser-level payment links target stream micro-value.
    wallet_address = Column(String, nullable=False)
    
    # Country/Region of active practice (e.g., 'Nigeria', 'Senegal')
    country = Column(String, nullable=False)
    
    # Original spoken or written cultural dialect (e.g., 'Yoruba', 'Swahili')
    language = Column(String, nullable=False)
    
    # Optional private email address for partner communications (not exposed publicly)
    email = Column(String, nullable=True)
    
    # Audit stamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
