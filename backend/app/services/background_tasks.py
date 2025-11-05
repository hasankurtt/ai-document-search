from app.services.document_processor import document_processor
from app.database import SessionLocal
from app.models import Document
import logging

logger = logging.getLogger(__name__)

def process_document_task(document_id: int):
    """Background task: Dökümanı işle"""
    db = SessionLocal()
    
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            logger.error(f"Document bulunamadı: {document_id}")
            return
        
        namespace = document.room.pinecone_namespace
        
        logger.info(f"Processing document {document_id}: {document.filename}")
        
        result = document_processor.process_document(
            file_path=document.file_path,
            document_id=document.id,
            filename=document.filename,
            namespace=namespace
        )
        
        document.processed = True
        document.chunk_count = result["chunk_count"]
        document.pinecone_vector_ids = result["vector_ids"]
        
        db.commit()
        
        logger.info(f"Document {document_id} başarıyla işlendi!")
        
    except Exception as e:
        logger.error(f"Document processing hatası ({document_id}): {e}")
        
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.processed = False
            db.commit()
    
    finally:
        db.close()
