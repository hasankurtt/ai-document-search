from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Room, Message, User
from app.schemas import ChatRequest, ChatResponse, MessageSource
from app.utils import get_current_user_id
from app.services.chat_service import chat_service
from app.limiter import limiter

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/{room_id}", response_model=ChatResponse)
@limiter.limit("10/day")
async def chat_with_documents(
    request: Request,
    room_id: int,
    chat_request: ChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Odadaki dökümanlarla chat yap
    """
    # Oda kontrolü
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.user_id == user_id
    ).first()
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oda bulunamadı"
        )
    
    # Chat yap
    result = await chat_service.chat(
        question=chat_request.question,
        namespace=room.pinecone_namespace
    )
    
    # Kullanıcı mesajını kaydet
    user_message = Message(
        room_id=room_id,
        user_id=user_id,
        message_type="user",
        content=chat_request.question,
        tokens_used=0
    )
    db.add(user_message)
    
    # AI cevabını kaydet
    ai_message = Message(
        room_id=room_id,
        user_id=user_id,
        message_type="ai",
        content=result['answer'],
        sources=result['sources'],
        tokens_used=result['tokens_used']
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    return ChatResponse(
        message_id=ai_message.id,
        question=chat_request.question,
        answer=result['answer'],
        sources=[
            MessageSource(**source) for source in result['sources']
        ],
        tokens_used=result['tokens_used'],
        created_at=ai_message.created_at
    )
@router.get("/history/{room_id}")
def get_chat_history(
    room_id: int,
    user_id: int = Depends(get_current_user_id),  # DEĞİŞTİ
    db: Session = Depends(get_db)
):
    """Get chat history for a room"""
    # Room kontrolü
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.user_id == user_id  # DEĞİŞTİ
    ).first()
    
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Mesajları getir (en eski → en yeni)
    messages = db.query(Message).filter(
        Message.room_id == room_id
    ).order_by(Message.created_at.asc()).all()
    
    # Response formatla
    result = []
    for msg in messages:
        result.append({
            "id": msg.id,
            "message_type": msg.message_type,
            "content": msg.content,
            "sources": msg.sources or [],
            "created_at": msg.created_at.isoformat()
        })
    
    return result