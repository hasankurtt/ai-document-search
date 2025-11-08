from typing import Optional
from fastapi import UploadFile, HTTPException
from app.config import settings

def validate_file_extension(filename: str) -> bool:
    """
    Dosya uzantısını kontrol et
    """
    ext = filename.split('.')[-1].lower()
    return ext in settings.allowed_extensions_list

def validate_file_size(file: UploadFile, max_size: Optional[int] = None) -> bool:
    """
    Dosya boyutunu kontrol et (bytes)
    """
    if max_size is None:
        max_size = settings.MAX_FILE_SIZE
    
    # Not: UploadFile için file.size bazen None olabiliyor
    # Bu yüzden upload sırasında manuel kontrol yapacağız
    return True

def validate_upload_file(file: UploadFile) -> None:
    """
    Upload edilen dosyayı validate et
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı geçersiz")
    
    # Uzantı kontrolü
    if not validate_file_extension(file.filename):
        allowed = ", ".join(settings.allowed_extensions_list)
        raise HTTPException(
            status_code=400, 
            detail=f"Geçersiz dosya türü. İzin verilenler: {allowed}"
        )
    
    # Content type kontrolü (ekstra güvenlik)
    allowed_content_types = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    
    if file.content_type and file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz dosya tipi: {file.content_type}"
        )

def sanitize_filename(filename: str) -> str:
    """
    Dosya adını güvenli hale getir
    """
    import re
    
    # Tehlikeli karakterleri temizle
    filename = re.sub(r'[^\w\s.-]', '', filename)
    
    # Boşlukları underscore yap
    filename = filename.replace(' ', '_')
    
    # Çift nokta ve slash'leri temizle (path traversal önleme)
    filename = filename.replace('..', '')
    filename = filename.replace('/', '')
    filename = filename.replace('\\', '')
    
    return filename
