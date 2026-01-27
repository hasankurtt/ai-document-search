from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Room, Document, Message
from app.schemas import RoomCreate, RoomUpdate, RoomResponse, RoomWithStats
from app.utils import get_current_user_id

router = APIRouter(prefix="/rooms", tags=["Rooms"])

@router.post("", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
async def create_room(
    room_data: RoomCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Yeni oda oluştur
    """
    # Pinecone namespace oluştur (unique)
    user_room_count = db.query(Room).filter(Room.user_id == user_id).count()
    
    if user_room_count >= 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maksimum oda limitine ulaştınız ({user_room_count}/2). Yeni oda oluşturmak için önce eski odaları silin."
        )

    import uuid
    namespace = f"room_{uuid.uuid4().hex[:8]}"
    
    new_room = Room(
        user_id=user_id,
        name=room_data.name,
        description=room_data.description,
        emoji=room_data.emoji,
        pinecone_namespace=namespace
    )
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

@router.get("", response_model=List[RoomWithStats])
async def get_user_rooms(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Kullanıcının tüm odalarını listele (istatistiklerle)
    """
    rooms = db.query(Room).filter(Room.user_id == user_id).all()
    
    # Her oda için istatistikleri ekle
    rooms_with_stats = []
    for room in rooms:
        room_dict = {
            "id": room.id,
            "user_id": room.user_id,
            "name": room.name,
            "description": room.description,
            "emoji": room.emoji,
            "pinecone_namespace": room.pinecone_namespace,
            "created_at": room.created_at,
            "updated_at": room.updated_at,
            "document_count": len(room.documents),
            "message_count": len(room.messages)
        }
        rooms_with_stats.append(room_dict)
    
    return rooms_with_stats

@router.get("/{room_id}", response_model=RoomWithStats)
async def get_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Belirli bir odayı getir
    """
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.user_id == user_id
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oda bulunamadı"
        )
    
    return {
        "id": room.id,
        "user_id": room.user_id,
        "name": room.name,
        "description": room.description,
        "emoji": room.emoji,
        "pinecone_namespace": room.pinecone_namespace,
        "created_at": room.created_at,
        "updated_at": room.updated_at,
        "document_count": len(room.documents),
        "message_count": len(room.messages)
    }

@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(
    room_id: int,
    room_data: RoomUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Oda bilgilerini güncelle
    """
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.user_id == user_id
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oda bulunamadı"
        )
    
    # Sadece gönderilen alanları güncelle
    if room_data.name is not None:
        room.name = room_data.name
    if room_data.description is not None:
        room.description = room_data.description
    if room_data.emoji is not None:
        room.emoji = room_data.emoji
    
    db.commit()
    db.refresh(room)
    
    return room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Oda sil (cascade: documents ve messages de silinir)
    """
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.user_id == user_id
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oda bulunamadı"
        )
    
    db.delete(room)
    db.commit()
    
    return None
