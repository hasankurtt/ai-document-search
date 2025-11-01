from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Document Response
class DocumentResponse(BaseModel):
    id: int
    room_id: int
    filename: str
    file_size: Optional[int]
    mime_type: Optional[str]
    processed: bool
    chunk_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Document Upload Response
class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    message: str = "Document uploaded successfully"

# Document Processing Status
class DocumentProcessingStatus(BaseModel):
    document_id: int
    filename: str
    processed: bool
    chunk_count: int
    status: str  # 'pending', 'processing', 'completed', 'failed'
