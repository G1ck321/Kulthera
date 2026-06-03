from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

# Import database, models, and validation schemas
from app.core.database import get_db
from app.models import Room
from app.schemas.room import RoomResponse

# Instantiate router context
router = APIRouter(prefix="/rooms", tags=["Museum Rooms"])


@router.get("/", response_model=List[RoomResponse])
async def list_rooms(db: AsyncSession = Depends(get_db)) -> List[Room]:
    """
    Fetch all themed wings inside the Museum Lobby.
    Sorted according to display order.
    """
    # 1. Prepare async query
    query = select(Room).order_by(Room.display_order.asc())
    
    # 2. Execute query asynchronously on active pool
    result = await db.execute(query)
    
    # 3. Retrieve list results
    rooms = result.scalars().all()
    return list(rooms)


@router.get("/{room_slug}", response_model=RoomResponse)
async def get_room(room_slug: str, db: AsyncSession = Depends(get_db)) -> Room:
    """
    Fetch descriptive details of a specific Museum Room wing.
    """
    # 1. Query by unique room slug
    query = select(Room).where(Room.slug == room_slug)
    result = await db.execute(query)
    room = result.scalar_one_or_none()
    
    # 2. Raise descriptive HTTP error if wing is missing
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Museum Room with slug '{room_slug}' could not be located in our gallery archive."
        )
        
    return room
