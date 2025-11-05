from typing import List, Dict, Any
from openai import OpenAI
from pinecone import Pinecone
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class ChatService:
    """AI Chat servisi"""
    
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pinecone_client.Index(settings.PINECONE_INDEX_NAME)
    
    def create_query_embedding(self, question: str) -> List[float]:
        """Soruyu embedding'e çevir"""
        response = self.openai_client.embeddings.create(
            input=question,
            model=settings.OPENAI_EMBEDDING_MODEL
        )
        return response.data[0].embedding
    
    def search_relevant_chunks(
        self, 
        query_embedding: List[float], 
        namespace: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Pinecone'da ilgili chunk'ları bul"""
        results = self.index.query(
            namespace=namespace,
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        chunks = []
        for match in results['matches']:
            if match['score'] > 0.3:  # Düşük threshold (test için)
                chunks.append({
                    'text': match['metadata'].get('text', ''),
                    'score': match['score'],
                    'document_id': match['metadata'].get('document_id'),
                    'filename': match['metadata'].get('filename')
                })
        
        return chunks
    
    def generate_answer(
        self, 
        question: str, 
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """OpenAI GPT ile cevap oluştur"""
        
        # Context'i birleştir
        context = "\n\n".join([
            f"[Kaynak: {chunk['filename']}]\n{chunk['text']}" 
            for chunk in context_chunks
        ])
        
        # Prompt oluştur
        system_prompt = """Sen yardımcı bir AI asistansın. 
Kullanıcının sorularını verilen dokümanlar bağlamında cevapla.
Cevaplarını Türkçe ver, net ve anlaşılır ol.
Eğer dokümanlarda cevap yoksa, bunu söyle."""
        
        user_prompt = f"""Dokümanlar:
{context}

Soru: {question}

Lütfen yukarıdaki dokümanlara dayanarak soruyu cevapla."""
        
        # OpenAI'ye gönder
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        answer = response.choices[0].message.content
        tokens_used = response.usage.total_tokens
        
        return {
            "answer": answer,
            "tokens_used": tokens_used,
            "sources": [
                {
                    "document_id": chunk['document_id'],
                    "filename": chunk['filename'],
                    "score": chunk['score']
                }
                for chunk in context_chunks
            ]
        }
    
    def chat(self, question: str, namespace: str) -> Dict[str, Any]:
        """Ana chat fonksiyonu"""
        
        # 1. Soruyu embedding'e çevir
        query_embedding = self.create_query_embedding(question)
        
        # 2. İlgili chunk'ları bul
        relevant_chunks = self.search_relevant_chunks(query_embedding, namespace)
        
        if not relevant_chunks:
            return {
                "answer": "Üzgünüm, bu soruya cevap verebilecek doküman bulamadım.",
                "tokens_used": 0,
                "sources": []
            }
        
        # 3. GPT ile cevap oluştur
        result = self.generate_answer(question, relevant_chunks)
        
        logger.info(f"Chat: {len(relevant_chunks)} chunks, {result['tokens_used']} tokens")
        
        return result

# Singleton
chat_service = ChatService()
