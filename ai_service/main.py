"""
BSearch AI Service
Python FastAPI implementation for AI-powered search features
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import re

app = FastAPI(title="BSearch AI Service", version="1.0.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class QueryRequest(BaseModel):
    query: str
    context: Optional[List[Dict]] = []
    language: Optional[str] = "fa"

class TextRequest(BaseModel):
    text: str

class SimilarityRequest(BaseModel):
    query: str
    documents: List[str]

class SEOGenerateRequest(BaseModel):
    url: str
    type: Optional[str] = "page"


@app.get("/")
async def root():
    return {"status": "ok", "service": "BSearch AI", "version": "1.0.0"}


@app.post("/api/generate")
async def generate_answer(request: QueryRequest):
    """Generate AI answer from query and context"""
    
    # Simple extractive summarization (production would use LLM)
    answer = generate_extractive_summary(request.query, request.context)
    
    sources = []
    if request.context:
        sources = [{"title": item.get("title", ""), "url": item.get("url", "")} 
                   for item in request.context[:3]]
    
    return {
        "answer": answer,
        "sources": sources,
        "confidence": 0.85,
        "model": "persian-extractive-v1"
    }


@app.post("/api/similarity")
async def get_similarity(request: SimilarityRequest):
    """Calculate semantic similarity between query and documents"""
    
    scores = []
    query_lower = request.query.lower()
    
    for doc in request.documents:
        doc_lower = doc.lower()
        
        # Simple word overlap similarity
        query_words = set(query_lower.split())
        doc_words = set(doc_lower.split())
        
        if len(query_words) == 0 or len(doc_words) == 0:
            scores.append(0.0)
            continue
        
        overlap = len(query_words & doc_words)
        similarity = overlap / max(len(query_words), len(doc_words))
        scores.append(min(1.0, similarity * 2))
    
    return {"scores": scores}


@app.post("/api/entities")
async def extract_entities(request: TextRequest):
    """Extract named entities from text"""
    
    # Simple pattern-based entity extraction
    entities = []
    
    # Persian date pattern
    date_pattern = r'\b(\d{4})/(\d{1,2})/(\d{1,2})\b'
    for match in re.finditer(date_pattern, request.text):
        entities.append({"text": match.group(), "type": "DATE"})
    
    # URL pattern
    url_pattern = r'https?://[^\s]+'
    for match in re.finditer(url_pattern, request.text):
        entities.append({"text": match.group(), "type": "URL"})
    
    # Numbers
    num_pattern = r'\b\d+\b'
    for match in re.finditer(num_pattern, request.text):
        entities.append({"text": match.group(), "type": "NUMBER"})
    
    return {"entities": entities}


@app.post("/api/spellcheck")
async def spellcheck(request: TextRequest):
    """Correct spelling for Persian/English queries"""
    
    text = request.text
    
    # Simple Persian character normalization
    corrections = {
        'ك': 'ک',
        'ي': 'ی',
        'ى': 'ی',
        'ۀ': 'ه',
        'ة': 'ه',
    }
    
    corrected = text
    for wrong, right in corrections.items():
        corrected = corrected.replace(wrong, right)
    
    return {"corrected": corrected, "original": text}


@app.post("/api/intent")
async def detect_intent(request: QueryRequest):
    """Detect user query intent"""
    
    query = request.query.lower()
    
    # Intent keywords (Persian/English)
    informational = ['چیست', 'چگونه', 'چطور', 'what', 'how', 'why', 'when', 'where']
    navigational = ['سایت', 'site', 'login', 'ورود', 'صفحه', 'page']
    transactional = ['خرید', 'buy', 'قیمت', 'price', 'فروش', 'sell']
    
    if any(word in query for word in informational):
        intent = "informational"
    elif any(word in query for word in navigational):
        intent = "navigational"
    elif any(word in query for word in transactional):
        intent = "transactional"
    else:
        intent = "informational"
    
    return {"intent": intent, "confidence": 0.75}


@app.post("/api/seo/generate")
async def generate_seo(request: SEOGenerateRequest):
    """Generate SEO content for a page"""
    
    # Placeholder SEO generation
    base_title = "عنوان بهینه شده برای صفحه"
    base_desc = "توضیحات متا بهینه شده برای موتورهای جستجو که شامل کلمات کلیدی مرتبط است."
    
    if request.type == "article":
        schema = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": base_title,
            "description": base_desc
        }
    else:
        schema = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": base_title,
            "description": base_desc
        }
    
    return {
        "title": base_title,
        "meta_description": base_desc,
        "keywords": ["کلمه کلیدی ۱", "کلمه کلیدی ۲", "کلمه کلیدی ۳"],
        "schema_markup": schema
    }


def generate_extractive_summary(query: str, context: list) -> str:
    """Generate summary by extracting relevant sentences"""
    
    if not context:
        return "پاسخی برای این سوال یافت نشد."
    
    query_words = set(query.lower().split())
    scored_sentences = []
    
    for item in context:
        content = item.get("content", "")
        if not content:
            continue
        
        # Split into sentences (simple split for Persian/English)
        sentences = re.split(r'[.!?۔]', content)
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 20 or len(sentence) > 300:
                continue
            
            # Score by word overlap
            sentence_words = set(sentence.lower().split())
            overlap = len(query_words & sentence_words)
            score = overlap / len(query_words) if query_words else 0
            
            if score > 0:
                scored_sentences.append((score, sentence))
    
    # Sort by score and take top 3
    scored_sentences.sort(reverse=True, key=lambda x: x[0])
    top_sentences = [s[1] for s in scored_sentences[:3]]
    
    if top_sentences:
        return ". ".join(top_sentences) + "."
    
    return "پاسخی برای این سوال یافت نشد."


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
