from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from pathlib import Path
from app.database import get_db
from app.models import Room, Document
from app.schemas import DocumentResponse, DocumentUploadResponse
from app.utils import get_current_user_id, validate_upload_file, sanitize_filename
from app.config import settings
from app.services import process_document_task
from pinecone import Pinecone
import logging
from app.limiter import limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload/{room_id}", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/day")
async def upload_document(
    request: Request,
    room_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Odaya dosya yükle ve arka planda işle
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
    
    # Dosya validasyonu
    validate_upload_file(file)
    
    # Dosya adını güvenli hale getir
    safe_filename = sanitize_filename(file.filename)
    
    # Upload klasörünü oluştur
    upload_path = Path(settings.UPLOAD_DIR) / f"user_{user_id}" / f"room_{room_id}"
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Dosya yolu
    file_path = upload_path / safe_filename
    
    # Aynı isimde dosya varsa, yeni isim ver
    counter = 1
    original_stem = file_path.stem
    while file_path.exists():
        file_path = upload_path / f"{original_stem}_{counter}{file_path.suffix}"
        counter += 1
    
    # Dosyayı kaydet
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dosya yüklenirken hata oluştu: {str(e)}"
        )
    
    # Dosya boyutunu al
    file_size = file_path.stat().st_size
        
    # Dosya boyutu kontrolü
    if file_size > settings.MAX_FILE_SIZE:
        file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Dosya çok büyük. Maksimum: {settings.MAX_FILE_SIZE / (1024*1024):.1f} MB"
        )

    # Dosya içeriği kontrolü (karakter sayısı)
    try:
        from app.services.document_processor import document_processor
        text = document_processor.extract_text(str(file_path))
        
        if not text or len(text.strip()) < 50:
            file_path.unlink()  # Dosyayı sil
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dosya içeriği yetersiz. {len(text.strip()) if text else 0} karakter bulundu, minimum 50 karakter gerekli."
            )
    except HTTPException:
        raise  # HTTPException'ı tekrar fırlat
    except Exception as e:
        file_path.unlink()  # Hata varsa dosyayı sil
        logger.error(f"Dosya okuma hatası: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Dosya okunamadı veya formatı desteklenmiyor."
        )

    # Database'e kaydet
    new_document = Document(
        room_id=room_id,
        filename=file_path.name,
        file_path=str(file_path),
        file_size=file_size,
        mime_type=file.content_type,
        processed=False
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Background task başlat
    background_tasks.add_task(process_document_task, new_document.id)
    
    return {
        "id": new_document.id,
        "filename": new_document.filename,
        "file_size": new_document.file_size,
        "message": "Dosya başarıyla yüklendi. İşleniyor..."
    }

@router.get("/room/{room_id}", response_model=List[DocumentResponse])
async def get_room_documents(
    room_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Odadaki tüm dosyaları listele
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
    
    documents = db.query(Document).filter(Document.room_id == room_id).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Belirli bir dökümanın detaylarını getir
    """
    document = db.query(Document).join(Room).filter(
        Document.id == document_id,
        Room.user_id == user_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Döküman bulunamadı"
        )
    
    return document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Dökümanı sil (fiziksel dosya + Pinecone vektörleri + database)
    """
    document = db.query(Document).join(Room).filter(
        Document.id == document_id,
        Room.user_id == user_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Döküman bulunamadı"
        )
    
    # 1. Pinecone'dan vektörleri sil
    try:
        if document.pinecone_vector_ids and len(document.pinecone_vector_ids) > 0:
            pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
            index = pinecone_client.Index(settings.PINECONE_INDEX_NAME)
            namespace = document.room.pinecone_namespace
            
            # JSON field zaten list olarak gelir, direkt kullan
            index.delete(
                ids=document.pinecone_vector_ids,
                namespace=namespace
            )
            logger.info(f"Deleted {len(document.pinecone_vector_ids)} vectors from Pinecone")
        else:
            logger.warning(f"No vector IDs found for document {document_id}")
            
    except Exception as e:
        logger.error(f"Pinecone silme hatası: {str(e)}", exc_info=True)
        # Pinecone hatası olsa bile devam et, dosya ve database silinsin
    
    # 2. Fiziksel dosyayı sil
    file_path = Path(document.file_path)
    if file_path.exists():
        try:
            file_path.unlink()
            logger.info(f"Deleted file: {file_path}")
        except Exception as e:
            logger.error(f"Dosya silinirken hata: {e}")
    
    # 3. Database'den sil
    db.delete(document)
    db.commit()
    
    logger.info(f"Document {document_id} fully deleted")
    return None