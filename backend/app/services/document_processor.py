from pathlib import Path
from typing import List, Dict, Any
import PyPDF2
from docx import Document as DocxDocument
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI
from pinecone import Pinecone
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Dökümanları işleyen servis"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Sayfa {page_num + 1} ---\n{page_text}"
            return text
        except Exception as e:
            logger.error(f"PDF okuma hatası: {e}")
            raise
    
    def extract_text_from_docx(self, file_path: str) -> str:
        try:
            doc = DocxDocument(file_path)
            text = "\n".join([p.text for p in doc.paragraphs])
            return text
        except Exception as e:
            logger.error(f"DOCX okuma hatası: {e}")
            raise
    
    def extract_text_from_txt(self, file_path: str) -> str:
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"TXT okuma hatası: {e}")
            raise
    
    def extract_text(self, file_path: str) -> str:
        file_path_obj = Path(file_path)
        extension = file_path_obj.suffix.lower()
        
        if extension == '.pdf':
            return self.extract_text_from_pdf(file_path)
        elif extension in ['.docx', '.doc']:
            return self.extract_text_from_docx(file_path)
        elif extension == '.txt':
            return self.extract_text_from_txt(file_path)
        else:
            raise ValueError(f"Desteklenmeyen dosya tipi: {extension}")
    
    def chunk_text(self, text: str) -> List[str]:
        chunks = self.text_splitter.split_text(text)
        logger.info(f"Text {len(chunks)} chunk'a bölündü")
        return chunks
    
    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        try:
            response = self.openai_client.embeddings.create(
                input=texts,
                model=settings.OPENAI_EMBEDDING_MODEL
            )
            embeddings = [item.embedding for item in response.data]
            logger.info(f"{len(embeddings)} embedding oluşturuldu")
            return embeddings
        except Exception as e:
            logger.error(f"Embedding hatası: {e}")
            raise
    
    def upsert_to_pinecone(
        self, 
        namespace: str, 
        chunks: List[str], 
        embeddings: List[List[float]],
        document_id: int,
        filename: str
    ) -> List[str]:
        try:
            index = self.pinecone_client.Index(settings.PINECONE_INDEX_NAME)
            
            vectors = []
            vector_ids = []
            
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                vector_id = f"doc_{document_id}_chunk_{i}"
                vector_ids.append(vector_id)
                
                vectors.append({
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        "document_id": document_id,
                        "filename": filename,
                        "chunk_index": i,
                        "text": chunk[:1000]
                    }
                })
            
            batch_size = 100
            for i in range(0, len(vectors), batch_size):
                batch = vectors[i:i + batch_size]
                index.upsert(vectors=batch, namespace=namespace)
            
            logger.info(f"{len(vectors)} vektör Pinecone'a yüklendi")
            return vector_ids
            
        except Exception as e:
            logger.error(f"Pinecone upsert hatası: {e}")
            raise
    
    def process_document(
        self, 
        file_path: str, 
        document_id: int,
        filename: str,
        namespace: str
    ) -> Dict[str, Any]:
        logger.info(f"Döküman işleniyor: {filename}")
        
        # 1. Text çıkar
        text = self.extract_text(file_path)
        if not text or len(text.strip()) < 50:
            raise Exception(f"Yetersiz text. Dosyada {len(text.strip()) if text else 0} karakter var, minimum 50 karakter gerekli.")            
        
        # 2. Chunk'lara böl
        chunks = self.chunk_text(text)
        
        # 3. Embedding oluştur
        embeddings = self.create_embeddings(chunks)
        
        # 4. Pinecone'a kaydet
        vector_ids = self.upsert_to_pinecone(
            namespace=namespace,
            chunks=chunks,
            embeddings=embeddings,
            document_id=document_id,
            filename=filename
        )
        
        return {
            "chunk_count": len(chunks),
            "vector_ids": vector_ids,
            "total_characters": len(text)
        }

document_processor = DocumentProcessor()
