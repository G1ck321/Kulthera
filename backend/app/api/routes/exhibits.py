from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func
from uuid import UUID
from typing import List, Optional

# Import database, models, and schemas
from app.core.database import get_db
from app.models import Exhibit, Room
from app.schemas.exhibit import ExhibitResponse

router = APIRouter(prefix="/exhibits", tags=["Museum Exhibits"])


@router.get("/", response_model=dict)
async def list_exhibits(
    room_slug: Optional[str] = None,
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Items per page (max 100)"),
    mediaType: Optional[str] = Query(None, description="Filter by media type (audio, painting, artifact, story)"),
    db: AsyncSession = Depends(get_db)
) -> dict:
    """
    Fetch paginated digital exhibits with optional filtering.
    
    Query Parameters:
    - room_slug: Filter by room slug (e.g., 'sound-roots', 'gallery')
    - page: Page number (default 1)
    - limit: Items per page (default 20, max 100)
    - mediaType: Filter by media type (audio, painting, artifact, story)
    
    Returns paginated results with metadata:
    {
        "exhibits": [...],
        "total": 150,
        "page": 1,
        "pages": 8
    }
    
    Teaching Moment for Juniors:
        In async SQLAlchemy, we must use `selectinload(Exhibit.creator)` to eagerly load 
        associated relationships within the same transaction. If we omit this, accessing
        `exhibit.creator` later inside the Pydantic serialization layer will raise a 
        `DetachedInstanceError` because the database session has closed.
    """
    # 1. Build base query with eager loading
    query = select(Exhibit).options(selectinload(Exhibit.creator)).order_by(Exhibit.display_order.asc())
    
    # 2. Apply filters
    if room_slug:
        query = query.join(Room).where(Room.slug == room_slug)
    
    if mediaType:
        query = query.where(Exhibit.media_type == mediaType)
    
    # 3. Get total count before pagination
    count_query = select(func.count(Exhibit.id))
    if room_slug:
        count_query = count_query.join(Room).where(Room.slug == room_slug)
    if mediaType:
        count_query = count_query.where(Exhibit.media_type == mediaType)
    
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # 4. Apply pagination
    skip = (page - 1) * limit
    query = query.offset(skip).limit(limit)
    
    # 5. Execute query
    result = await db.execute(query)
    exhibits = result.scalars().all()
    
    # 6. Calculate page count
    pages = (total + limit - 1) // limit if total > 0 else 0
    
    return {
        "exhibits": [
            ExhibitResponse.model_validate(exhibit).model_dump(mode="json")
            for exhibit in exhibits
        ],
        "total": total,
        "page": page,
        "pages": pages
    }


@router.get("/{exhibit_id}", response_model=ExhibitResponse)
async def get_exhibit(exhibit_id: UUID, db: AsyncSession = Depends(get_db)) -> Exhibit:
    """
    Fetch detailed structural metadata for a single specific Exhibit.
    Hydrates nested Creator profiles inline to enable creator-card renderings on client views.
    """
    # 1. Query by unique exhibit UUID
    query = select(Exhibit).options(selectinload(Exhibit.creator)).where(Exhibit.id == exhibit_id)
    result = await db.execute(query)
    exhibit = result.scalar_one_or_none()
    
    # 2. Enforce 404 security handling
    if not exhibit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exhibited digital artwork with ID '{exhibit_id}' could not be located in our collections."
        )
        
    return exhibit
