import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class VisitorSession(Base):
    """
    SQLAlchemy database model for tracking anonymous visitor sessions.
    
    Analogy:
        A 'VisitorSession' represents an active, anonymous visitor entering the museum.
        It acts like a visitor pass. It contains no personal information (PII) but helps 
        us bundle their consecutive exhibit view heartbeats under a single session.
    """
    __tablename__ = "visitor_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Secure, client-generated random token stored in localStorage (e.g. ksess_uuid)
    session_token = Column(String, unique=True, index=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_seen_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ExhibitViewSession(Base):
    """
    SQLAlchemy database model for tracking specific attention intervals per exhibit.
    
    Analogy:
        Think of this as a visitor standing in front of Yemi's guitar exhibit. 
        It tracks when they arrived, when they left, and exactly how many seconds their 
        browser successfully streamed micropayments.
    """
    __tablename__ = "exhibit_view_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # Token linking to parent visitor pass
    visitor_session_token = Column(String, ForeignKey("visitor_sessions.session_token", ondelete="CASCADE"), nullable=False)
    
    # Connections to target items
    exhibit_id = Column(UUID(as_uuid=True), ForeignKey("exhibits.id", ondelete="CASCADE"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("creators.id", ondelete="CASCADE"), nullable=False)
    
    # Redundant pointer address representing the payment path used during this session view
    wallet_address = Column(String, nullable=False)
    
    # Telemetry tracking duration logs
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    
    # Aggregated timers (updated on periodic client heartbeats)
    duration_seconds = Column(Integer, default=0, nullable=False)
    monetized_seconds = Column(Integer, default=0, nullable=False)
    
    # Active payment state ('idle', 'pending', 'streaming', 'paused')
    last_monetization_state = Column(String, default="idle", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 🔗 Relationships
    exhibit = relationship("Exhibit")
    creator = relationship("Creator")
    visitor_session = relationship("VisitorSession")


class MonetizationEvent(Base):
    """
    SQLAlchemy database model for granular Web Monetization transaction events.
    
    Analogy:
        Each time the visitor's wallet streams a microscopic fraction of a cent (micropayment),
        the browser emits a progress event. We log these dynamically to build the aggregate
        dashboard statistics for artists.
    """
    __tablename__ = "monetization_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    
    # View session connection
    exhibit_view_session_id = Column(UUID(as_uuid=True), ForeignKey("exhibit_view_sessions.id", ondelete="CASCADE"), nullable=False)
    
    # Event category (e.g. 'monetizationprogress', 'monetizationstart')
    event_type = Column(String, nullable=False)
    
    # Payment status ('streaming', 'paused', etc.)
    state = Column(String, nullable=False)
    
    # Transaction micropayment metadata (Asset codes and scale factors represent financial accuracy)
    # Stored as string to prevent floating-point rounding errors for precise currencies
    amount = Column(String, nullable=True)
    asset_code = Column(String, nullable=True)  # E.g. 'USD', 'XRP'
    asset_scale = Column(Integer, nullable=True) # E.g. 9 means the amount should be divided by 10^9
    
    # Complete, raw JSON payload event sent by browser (for future receipts check audit loops)
    raw_event = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 🔗 Relationship
    view_session = relationship("ExhibitViewSession", backref="monetization_events")
