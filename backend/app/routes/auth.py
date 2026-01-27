from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.limiter import limiter
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils import (

    hash_password, 

    verify_password, 

    create_access_token, 

    create_refresh_token, 

    verify_token,

    get_current_user_id

)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("2/day")
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):

    """

    Yeni kullanıcı kaydı

    """

    # Email kontrolü

    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:

        raise HTTPException(

            status_code=status.HTTP_400_BAD_REQUEST,

            detail="Bu email adresi zaten kullanımda"

        )

    

    # Şifreyi hash'le

    hashed_password = hash_password(user_data.password)

    

    # Yeni kullanıcı oluştur

    new_user = User(

        email=user_data.email,

        name=user_data.name,

        password_hash=hashed_password

    )

    

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    

    return new_user

@router.post("/login", response_model=Token)

async def login(credentials: UserLogin, db: Session = Depends(get_db)):

    """

    Kullanıcı girişi - Access & Refresh token döndür

    """

    # Kullanıcıyı bul

    user = db.query(User).filter(User.email == credentials.email).first()

    

    if not user:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Email veya şifre hatalı"

        )

    

    # Şifreyi kontrol et

    if not verify_password(credentials.password, user.password_hash):

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Email veya şifre hatalı"

        )

    

    # Token'ları oluştur

    access_token = create_access_token({"sub": user.id, "email": user.email})

    refresh_token = create_refresh_token({"sub": user.id})

    

    return {

        "access_token": access_token,

        "refresh_token": refresh_token,

        "token_type": "bearer"

    }

@router.post("/refresh", response_model=Token)

async def refresh_token_endpoint(refresh_token: str, db: Session = Depends(get_db)):

    """

    Refresh token ile yeni access token al

    """

    # Refresh token'ı doğrula

    payload = verify_token(refresh_token, "refresh")

    

    if not payload:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Geçersiz veya süresi dolmuş token"

        )

    

    user_id = int(payload.get("sub"))

    

    # Kullanıcıyı kontrol et

    user = db.query(User).filter(User.id == user_id).first()

    

    if not user:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Kullanıcı bulunamadı"

        )

    

    # Yeni token'lar oluştur

    new_access_token = create_access_token({"sub": user.id, "email": user.email})

    new_refresh_token = create_refresh_token({"sub": user.id})

    

    return {

        "access_token": new_access_token,

        "refresh_token": new_refresh_token,

        "token_type": "bearer"

    }

@router.get("/me", response_model=UserResponse)

async def get_current_user_info(

    user_id: int = Depends(get_current_user_id),  # ✅ Doğru dependency

    db: Session = Depends(get_db)

):

    """

    Mevcut kullanıcının bilgilerini getir

    """

    user = db.query(User).filter(User.id == user_id).first()

    

    if not user:

        raise HTTPException(

            status_code=status.HTTP_404_NOT_FOUND,

            detail="Kullanıcı bulunamadı"

        )

    

    return user

