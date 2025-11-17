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
        top_k: int = 10  # ← 5'ten 10'a çıkarıldı, daha fazla chunk alır
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
            # Similarity threshold: 0.5'e çıkarıldı (daha alakalı sonuçlar)
            if match['score'] > 0.5:
                chunks.append({
                    'text': match['metadata'].get('text', ''),
                    'score': match['score'],
                    'document_id': match['metadata'].get('document_id'),
                    'filename': match['metadata'].get('filename')
                })
        
        logger.info(f"Found {len(chunks)} relevant chunks (threshold: 0.5)")
        return chunks
    
    def generate_answer(
        self, 
        question: str, 
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """OpenAI GPT ile cevap oluştur"""
        
        # Context'i birleştir - score'a göre sırala (en alakalı önce)
        sorted_chunks = sorted(context_chunks, key=lambda x: x['score'], reverse=True)
        
        context = "\n\n---\n\n".join([
            f"Kaynak Dosya: {chunk['filename']}\nİçerik: {chunk['text']}" 
            for chunk in sorted_chunks[:5]  # En alakalı 5 chunk
        ])
        
        # İyileştirilmiş prompt
        system_prompt = """Sen profesyonel bir AI asistansın. Kullanıcıya verilen dokümanlar bağlamında doğru ve detaylı cevaplar veriyorsun.

KURALLAR:
1. SADECE verilen dokümanlardaki bilgileri kullan
2. Dokümanlardan DOĞRUDAN alıntı yap ve hangi kaynaktan aldığını belirt
3. Cevabını Türkçe, net ve anlaşılır bir şekilde ver
4. Eğer dokümanlarda cevap yoksa, açıkça "Bu bilgi verilen dokümanlarda bulunmuyor" de
5. Varsayımda bulunma, sadece dokümandaki bilgileri kullan
6. Tarih, isim, sayı gibi spesifik bilgileri tam olarak dokümandan aktar"""
        
        user_prompt = f"""Aşağıdaki doküman içeriklerine dayanarak soruyu cevapla:

=== DOKÜMANLAR ===
{context}

=== SORU ===
{question}

=== TALİMATLAR ===
Yukarıdaki dokümanlara dayanarak soruyu detaylı şekilde cevapla. Cevabını verirken hangi bilgiyi hangi kaynaktan aldığını belirt."""
        
        # OpenAI'ye gönder
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,  # 0.7'den 0.3'e düşürüldü - daha tutarlı cevaplar
            max_tokens=800  # 500'den 800'e çıkarıldı - daha detaylı cevaplar
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
                    "score": round(chunk['score'], 3)
                }
                for chunk in sorted_chunks[:5]  # En alakalı 5'ini göster
            ]
        }
    
    def chat(self, question: str, namespace: str) -> Dict[str, Any]:
        """Ana chat fonksiyonu"""
        
        logger.info(f"Chat question: {question[:100]}...")
        
        # 1. Soruyu embedding'e çevir
        query_embedding = self.create_query_embedding(question)
        
        # 2. İlgili chunk'ları bul
        relevant_chunks = self.search_relevant_chunks(query_embedding, namespace)
        
        if not relevant_chunks:
            logger.warning("No relevant chunks found")
            return {
                "answer": "Üzgünüm, bu soruya cevap verebilecek ilgili bilgi verilen dokümanlarda bulamadım. Lütfen sorunuzu başka şekilde sormayı deneyin veya farklı dokümanlar yükleyin.",
                "tokens_used": 0,
                "sources": []
            }
        
        # 3. GPT ile cevap oluştur
        result = self.generate_answer(question, relevant_chunks)
        
        logger.info(f"Chat completed: {len(relevant_chunks)} chunks used, {result['tokens_used']} tokens")
        
        return result

# Singleton
chat_service = ChatService()