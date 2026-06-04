from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List, Dict, Any
# In backend/app/api/routes/dashboard.py
from app.core.security import get_current_user
# Import database, models, and schemas
from app.core.database import get_db
from app.models import ExhibitViewSession, Exhibit, Creator

router = APIRouter(prefix="/dashboard", tags=["Creator Dashboard"])


@router.get("/creators/me", status_code=status.HTTP_200_OK)
async def get_current_creator_dashboard(
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get dashboard for current authenticated creator.

    For MVP: Returns the first creator in database (demo mode).
    TODO: Link authenticated users to creator profiles.
    """
    # 1. Get first creator (demo mode)
    creator_res = await db.execute(select(Creator).limit(1))
    creator = creator_res.scalar_one_or_none()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No creator found. Please set up a creator profile first."
        )

    # 2. Query aggregate metrics across all view sessions credited to this creator
    metrics_query = select(
        func.count(ExhibitViewSession.id).label("total_views"),
        func.sum(ExhibitViewSession.duration_seconds).label("total_duration"),
        func.sum(ExhibitViewSession.monetized_seconds).label("total_monetized")
    ).where(ExhibitViewSession.creator_id == creator.id)

    metrics_res = await db.execute(metrics_query)
    aggregate = metrics_res.fetchone()

    total_views = aggregate[0] or 0
    total_duration_seconds = aggregate[1] or 0
    total_monetized_seconds = aggregate[2] or 0

    # 3. Fetch detailed per-exhibit breakdown
    breakdown_query = select(
        Exhibit.title.label("title"),
        Exhibit.media_type.label("media_type"),
        func.count(ExhibitViewSession.id).label("views"),
        func.sum(ExhibitViewSession.duration_seconds).label("duration"),
        func.sum(ExhibitViewSession.monetized_seconds).label("monetized")
    ).select_from(Exhibit).outerjoin(
        ExhibitViewSession, ExhibitViewSession.exhibit_id == Exhibit.id
    ).where(
        Exhibit.creator_id == creator.id
    ).group_by(
        Exhibit.id, Exhibit.title, Exhibit.media_type
    )

    breakdown_res = await db.execute(breakdown_query)
    exhibits_metrics = []

    # Standard payout scaling: $0.0001 per monetized second
    PAYOUT_RATE_PER_SECOND = 0.0001

    for row in breakdown_res.fetchall():
        exh_views = row[2] or 0
        exh_duration = row[3] or 0
        exh_monetized = row[4] or 0
        exh_earnings = exh_monetized * PAYOUT_RATE_PER_SECOND

        exhibits_metrics.append({
            "title": row[0],
            "media_type": row[1],
            "views": exh_views,
            "duration_seconds": exh_duration,
            "monetized_seconds": exh_monetized,
            "estimated_earnings_usd": round(exh_earnings, 4)
        })

    # 4. Calculate final aggregate earnings
    total_earnings = total_monetized_seconds * PAYOUT_RATE_PER_SECOND

    # 5. Return dashboard data
    return {
        "creator": {
            "id": str(creator.id),
            "name": creator.name,
            "role": creator.role,
            "wallet_address": creator.wallet_address
        },
        "metrics": {
            "total_views": total_views,
            "total_attention_hours": round(total_duration_seconds / 3600, 2),
            "total_monetized_hours": round(total_monetized_seconds / 3600, 2),
            "estimated_earnings_usd": round(total_earnings, 4)
        },
        "exhibits": exhibits_metrics
    }

@router.get("/creators/{creator_id}", status_code=status.HTTP_200_OK)
async def get_creator_dashboard(
    creator_id: UUID, 
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Generate aggregate analytics metrics for a specific Creator's dashboard.
    
    Feasibility Concept:
        Computes aggregate views, attention length in hours, monetized active length,
        and dynamically estimates simulated test wallet earnings ($0.0001 per monetized second).
        Provides granular breakdown statistics per exhibit item.
    """
    # 1. Verify that the requested Creator exists in our directory
    creator_res = await db.execute(select(Creator).where(Creator.id == creator_id))
    creator = creator_res.scalar_one_or_none()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The specified Creator could not be located in our directory."
        )

    # 2. Query aggregate metrics across all view sessions credited to this creator
    metrics_query = select(
        func.count(ExhibitViewSession.id).label("total_views"),
        func.sum(ExhibitViewSession.duration_seconds).label("total_duration"),
        func.sum(ExhibitViewSession.monetized_seconds).label("total_monetized")
    ).where(ExhibitViewSession.creator_id == creator_id)
    
    metrics_res = await db.execute(metrics_query)
    aggregate = metrics_res.fetchone()
    
    total_views = aggregate[0] or 0
    total_duration_seconds = aggregate[1] or 0
    total_monetized_seconds = aggregate[2] or 0

    # 3. Fetch detailed per-exhibit breakdown logs
    # Connects Exhibit details with session aggregation groups
    breakdown_query = select(
        Exhibit.title.label("title"),
        Exhibit.media_type.label("media_type"),
        func.count(ExhibitViewSession.id).label("views"),
        func.sum(ExhibitViewSession.duration_seconds).label("duration"),
        func.sum(ExhibitViewSession.monetized_seconds).label("monetized")
    ).select_from(Exhibit).outerjoin(
        ExhibitViewSession, ExhibitViewSession.exhibit_id == Exhibit.id
    ).where(
        Exhibit.creator_id == creator_id
    ).group_by(
        Exhibit.id, Exhibit.title, Exhibit.media_type
    )

    breakdown_res = await db.execute(breakdown_query)
    exhibits_metrics = []
    
    # Standard payout scaling: $0.0001 per monetized second (approx $0.36 per hour)
    PAYOUT_RATE_PER_SECOND = 0.0001
    
    for row in breakdown_res.fetchall():
        exh_views = row[2] or 0
        exh_duration = row[3] or 0
        exh_monetized = row[4] or 0
        exh_earnings = exh_monetized * PAYOUT_RATE_PER_SECOND
        
        exhibits_metrics.append({
            "title": row[0],
            "media_type": row[1],
            "views": exh_views,
            "duration_seconds": exh_duration,
            "monetized_seconds": exh_monetized,
            "estimated_earnings_usd": round(exh_earnings, 4)
        })

    # Calculate final aggregate earnings
    total_earnings = total_monetized_seconds * PAYOUT_RATE_PER_SECOND

    # 4. Construct comprehensive responsive payload
    return {
        "creator": {
            "id": creator.id,
            "name": creator.name,
            "role": creator.role,
            "wallet_address": creator.wallet_address
        },
        "metrics": {
            "total_views": total_views,
            "total_attention_hours": round(total_duration_seconds / 3600, 2),
            "total_monetized_hours": round(total_monetized_seconds / 3600, 2),
            "estimated_earnings_usd": round(total_earnings, 4)
        },
        "exhibits": exhibits_metrics
    }


@router.get("/creators/{creator_id}/earnings", status_code=status.HTTP_200_OK)
async def get_creator_earnings(
    creator_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get simplified earnings summary for a creator.
    Provides total earnings, transaction count, and last payment timestamp.
    
    Returns:
    {
        "creator_id": "uuid",
        "total_earnings": 12.5432,
        "transaction_count": 245,
        "last_payment": "2026-06-01T15:30:00",
        "currency": "USD",
        "monetized_hours": 34.5
    }
    """
    # 1. Verify creator exists
    creator_res = await db.execute(select(Creator).where(Creator.id == creator_id))
    creator = creator_res.scalar_one_or_none()
    if not creator:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creator not found"
        )
    
    # 2. Get earnings metrics
    metrics_query = select(
        func.sum(ExhibitViewSession.monetized_seconds).label("total_monetized"),
        func.count(ExhibitViewSession.id).label("transaction_count"),
        func.max(ExhibitViewSession.ended_at).label("last_payment")
    ).where(ExhibitViewSession.creator_id == creator_id)
    
    result = await db.execute(metrics_query)
    metrics = result.one()
    
    total_monetized_seconds = metrics[0] or 0
    transaction_count = metrics[1] or 0
    last_payment = metrics[2]
    
    # 3. Calculate earnings ($0.0001 per monetized second)
    PAYOUT_RATE_PER_SECOND = 0.0001
    total_earnings = total_monetized_seconds * PAYOUT_RATE_PER_SECOND
    monetized_hours = round(total_monetized_seconds / 3600, 2)
    
    return {
        "creator_id": str(creator_id),
        "total_earnings": round(total_earnings, 4),
        "transaction_count": transaction_count,
        "last_payment": last_payment,
        "currency": "USD",
        "monetized_hours": monetized_hours
    }


@router.get("/creators/me")
async def get_current_creator_dashboard(
    db: AsyncSession = Depends(get_db),
    token_data: dict = Depends(get_current_user)   # <-- new
) -> Dict[str, Any]:
    # token_data["user_id"] is the creator’s id
    creator_res = await db.execute(select(Creator).where(Creator.id == token_data["user_id"]))
    ...