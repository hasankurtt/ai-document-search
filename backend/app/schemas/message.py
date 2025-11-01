from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Message Source (kaynak doküman)
class MessageSource(BaseModel):
    document_id: int
    filename: str
    page_number: Optional[int] = None
    chunk_text: Optional[str] = None

# Chat Request (kullanıcının sorusu)
class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)

# Chat Response (AI'ın cevabı)
class ChatResponse(BaseModel):
    message_id: int
    question: str
    answer: str
    sources: List[MessageSource] = []
    tokens_used: int
    created_at: datetime

# Message Response (genel)
class MessageResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    message_type: str  # 'user' or 'ai'
    content: str
    sources: Optional[List[Dict[str, Any]]] = None
    tokens_used: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message History
class MessageHistory(BaseModel):
    messages: List[MessageResponse]
    total_count: int
    page: int
    page_size: int
