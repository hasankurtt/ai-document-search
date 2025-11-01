from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# User Registration
class UserCreate(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)

# User Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# User Response (without password)
class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    subscription_tier: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Update
class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    
# Token Response
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
