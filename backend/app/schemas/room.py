from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Room Create
class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    emoji: str = Field(default='📚', max_length=10)

# Room Update
class RoomUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    emoji: Optional[str] = Field(None, max_length=10)

# Room Response
class RoomResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    emoji: str
    pinecone_namespace: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Room with Stats
class RoomWithStats(RoomResponse):
    document_count: int = 0
    message_count: int = 0
