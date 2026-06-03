from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.sql import func
from uuid import UUID

# Import database, models, and schemas
from app.core.database import get_db
from app.models import VisitorSession, ExhibitViewSession, MonetizationEvent, Exhibit
from app.schemas.analytics import (
    VisitorSessionCreate, VisitorSessionResponse,
    ExhibitViewSessionStart, ExhibitViewSessionHeartbeat, ExhibitViewSessionResponse,
    MonetizationEventCreate
)

router = APIRouter(prefix="/analytics", tags=["Telemetry & Analytics"])


@router.post("/session", response_model=VisitorSessionResponse, status_code=status.HTTP_200_OK)
async def get_or_create_session(
    payload: VisitorSessionCreate, 
    db: AsyncSession = Depends(get_db)
) -> VisitorSession:
    """
    Validate or generate an anonymous visitor pass session token.
    Ensures stable session tracking without requiring personal information.
    """
    # 1. Check if token already exists in db
    query = select(VisitorSession).where(VisitorSession.session_token == payload.session_token)
    result = await db.execute(query)
    session = result.scalar_one_or_none()
    
    # 2. If new token, create and persist
    if not session:
        session = VisitorSession(session_token=payload.session_token)
        db.add(session)
        await db.commit()
        await db.refresh(session)
        print(f"[Telemetry] Registered new visitor session: {payload.session_token}")
    else:
        # Update last seen timestamp
        session.last_seen_at = func.now()
        await db.commit()
        
    return session


@router.post("/view-start", response_model=ExhibitViewSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_view_session(
    payload: ExhibitViewSessionStart, 
    db: AsyncSession = Depends(get_db)
) -> ExhibitViewSession:
    """
    Log that a visitor has opened an exhibit.
    Starts the attention session window.
    
    Security Shield:
        Instead of trusting the client to tell us which creator should be credited,
        we fetch the authenticated creator_id and payment pointer directly from our 
        exhibit records, ensuring monetization integrity.
    """
    # 1. Verify visitor pass validity
    sess_query = select(VisitorSession).where(VisitorSession.session_token == payload.visitor_session_token)
    sess_res = await db.execute(sess_query)
    visitor_pass = sess_res.scalar_one_or_none()
    if not visitor_pass:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The provided visitor session token is invalid or has expired."
        )

    # 2. Fetch target exhibit data
    exh_query = select(Exhibit).where(Exhibit.id == payload.exhibit_id)
    exh_res = await db.execute(exh_query)
    exhibit = exh_res.scalar_one_or_none()
    if not exhibit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The targeted digital exhibit does not exist in our collections."
        )

    # 3. Initialize a new view session entry
    view_session = ExhibitViewSession(
        visitor_session_token=visitor_pass.session_token,
        exhibit_id=exhibit.id,
        creator_id=exhibit.creator_id,
        wallet_address=exhibit.wallet_address,
        last_monetization_state="idle"
    )
    
    db.add(view_session)
    await db.commit()
    await db.refresh(view_session)
    
    print(f"[Telemetry] View started on '{exhibit.title}' for session {visitor_pass.session_token}")
    return view_session


@router.post("/view-heartbeat", status_code=status.HTTP_204_NO_CONTENT)
async def process_heartbeat(
    payload: ExhibitViewSessionHeartbeat, 
    db: AsyncSession = Depends(get_db)
):
    """
    Receive lightweight periodic attention updates from client viewers.
    Perform async, non-blocking updates to increment total elapsed attention timers.
    """
    # 1. Fetch current active session
    query = select(ExhibitViewSession).where(
        (ExhibitViewSession.id == payload.exhibit_view_session_id) &
        (ExhibitViewSession.visitor_session_token == payload.visitor_session_token)
    )
    result = await db.execute(query)
    view_session = result.scalar_one_or_none()
    
    if not view_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The specified exhibit view session could not be tracked."
        )
        
    # 2. Update aggregate metrics
    view_session.duration_seconds += payload.duration_increment
    view_session.monetized_seconds += payload.monetized_increment
    view_session.last_monetization_state = payload.last_monetization_state
    
    # 3. Update parent visitor activity timestamp
    await db.execute(
        update(VisitorSession)
        .where(VisitorSession.session_token == payload.visitor_session_token)
        .values(last_seen_at=func.now())
    )
    
    await db.commit()


@router.post("/monetization-event", status_code=status.HTTP_201_CREATED)
async def log_monetization_event(
    payload: MonetizationEventCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Log granular transaction progress event packages dispatched by native browsers.
    Useful for building creator monetization aggregate statistics.
    """
    # 1. Validate associated view session
    query = select(ExhibitViewSession).where(ExhibitViewSession.id == payload.exhibit_view_session_id)
    result = await db.execute(query)
    session_exists = result.scalar_one_or_none()
    
    if not session_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The linked exhibit view session is invalid."
        )
        
    # 2. Log transaction details
    event = MonetizationEvent(
        exhibit_view_session_id=payload.exhibit_view_session_id,
        event_type=payload.event_type,
        state=payload.state,
        amount=payload.amount,
        asset_code=payload.asset_code,
        asset_scale=payload.asset_scale,
        raw_event=payload.raw_event
    )
    
    db.add(event)
    await db.commit()
