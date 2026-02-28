from typing import List, Dict, Any
from pinecone import Pinecone
from app.config import settings
import logging

import asyncio
from functools import partial
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class ChatService:
    """AI Chat service"""
    
    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.pinecone_client = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pinecone_client.Index(settings.PINECONE_INDEX_NAME)
    
    async def create_query_embedding(self, question: str) -> List[float]:
        """Convert question to embedding"""
        response = await self.openai_client.embeddings.create(
            input=question,
            model=settings.OPENAI_EMBEDDING_MODEL
        )
        return response.data[0].embedding
    
    async def search_relevant_chunks(
        self, 
        query_embedding: List[float], 
        namespace: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Find relevant chunks in Pinecone"""
        
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            None,
            partial(
                self.index.query,
                namespace=namespace,
                vector=query_embedding,
                top_k=top_k,
                include_metadata=True
            )
        )
        
        chunks = []
        for match in results['matches']:
            if match['score'] > 0.5:
                chunks.append({
                    'text': match['metadata'].get('text', ''),
                    'score': match['score'],
                    'document_id': match['metadata'].get('document_id'),
                    'filename': match['metadata'].get('filename')
                })
        
        logger.info(f"Found {len(chunks)} relevant chunks (threshold: 0.5)")
        return chunks
    
    async def generate_answer(
        self, 
        question: str, 
        context_chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate answer using OpenAI GPT"""
        
        sorted_chunks = sorted(context_chunks, key=lambda x: x['score'], reverse=True)
        
        context = "\n\n---\n\n".join([
            f"Source File: {chunk['filename']}\nContent: {chunk['text']}" 
            for chunk in sorted_chunks[:5]
        ])
        
        system_prompt = """You are a professional AI assistant. You provide accurate and detailed answers based on the provided documents.

RULES:
1. ONLY use information from the provided documents
2. Quote DIRECTLY from documents and cite the source
3. Answer in English, clearly and concisely
4. If the answer is not in the documents, say "This information is not available in the provided documents"
5. Do not make assumptions, only use information from the documents
6. Accurately extract specific details like dates, names, and numbers from the documents"""
        
        user_prompt = f"""Based on the following document contents, answer the question:

=== DOCUMENTS ===
{context}

=== QUESTION ===
{question}

=== INSTRUCTIONS ===
Answer the question in detail based on the documents above. Cite which source each piece of information comes from."""
        
        response = await self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.3,
            max_tokens=800
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
                    "score": round(chunk['score'], 3),
                    "chunk_text": chunk['text']
                }
                for chunk in sorted_chunks[:5]
            ]
        }
        
    async def chat(self, question: str, namespace: str) -> Dict[str, Any]:
        """Main chat function"""
        
        logger.info(f"Chat question: {question[:100]}...")
        
        query_embedding = await self.create_query_embedding(question)
        relevant_chunks = await self.search_relevant_chunks(query_embedding, namespace)
        
        if not relevant_chunks:
            logger.warning("No relevant chunks found")
            return {
                "answer": "I'm sorry, I couldn't find relevant information in the provided documents to answer this question.",
                "tokens_used": 0,
                "sources": []
            }
        
        result = await self.generate_answer(question, relevant_chunks)
        
        logger.info(f"Chat completed: {len(relevant_chunks)} chunks used, {result['tokens_used']} tokens")
        
        return result

# Singleton
chat_service = ChatService()
