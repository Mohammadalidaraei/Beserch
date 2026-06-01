# BSearch Architecture Documentation

## System Overview

BSearch is a distributed search engine system built with microservices architecture. The system consists of three main components:

1. **Frontend** (Next.js) - User interface and client-side rendering
2. **Backend** (Laravel) - API server, business logic, and data management
3. **AI Service** (FastAPI/Python) - Machine learning and NLP processing

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Mobile    │  │   Tablet    │  │  Desktop    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      CDN / Edge Layer                        │
│                    (Cloudflare / ArvanCloud)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer (Nginx)                    │
│              SSL Termination & Request Routing               │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
    │   Frontend    │ │    Backend    │ │   AI Service  │
    │   Next.js     │ │   Laravel     │ │   FastAPI     │
    │   Port 3000   │ │   Port 8000   │ │   Port 8001   │
    └───────────────┘ └───────────────┘ └───────────────┘
            │               │               │
            │               ▼               │
            │    ┌─────────────────────┐   │
            │    │   PostgreSQL DB     │   │
            │    │   Primary Database  │   │
            │    └─────────────────────┘   │
            │               │               │
            │    ┌─────────────────────┐   │
            │    │      Redis          │   │
            │    │   Cache & Queue     │   │
            │    └─────────────────────┘   │
            │               │               │
            │    ┌─────────────────────┐   │
            │    │    OpenSearch       │◄──┘
            │    │   Search Engine     │
            │    └─────────────────────┘   │
            │                               │
            └───────────────┬───────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │   Crawler Workers │
                  │   (Queue Jobs)    │
                  └───────────────────┘
```

## Component Details

### Frontend (Next.js)

**Responsibilities:**
- Server-side rendering for SEO
- Client-side interactivity
- PWA capabilities
- RTL support for Persian
- Dark/Light theme switching

**Key Features:**
- Responsive design (Mobile-first)
- Voice search integration
- Real-time search suggestions
- Infinite scroll for results
- Image and video galleries

**Technology Stack:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS
- SWR for data fetching
- Zustand for state management

### Backend (Laravel)

**Responsibilities:**
- RESTful API endpoints
- Authentication & Authorization
- Database management
- Search indexing
- Crawler orchestration
- Rate limiting & security

**Core Services:**

1. **Crawler Service**
   - Web page crawling
   - Robots.txt compliance
   - Link extraction
   - Content parsing
   - Language detection

2. **Indexer Service**
   - Document indexing in OpenSearch
   - BM25 scoring
   - PageRank calculation
   - Entity extraction

3. **Search Service**
   - Query processing
   - Result ranking
   - Spell correction
   - Synonym expansion
   - Faceted search

4. **AI Integration Service**
   - Communication with AI service
   - RAG implementation
   - Response caching

**Technology Stack:**
- Laravel 12
- PHP 8.3
- PostgreSQL 16
- Redis 7
- OpenSearch 2.x
- Laravel Sanctum (Auth)
- Laravel Scout (Search)

### AI Service (FastAPI/Python)

**Responsibilities:**
- Natural Language Processing
- Semantic search
- AI answer generation
- SEO analysis
- Entity recognition
- Sentiment analysis

**ML Models:**

1. **Persian BERT**
   - Text classification
   - Named entity recognition
   - Question answering

2. **Embedding Model**
   - Document embeddings
   - Query embeddings
   - Semantic similarity

3. **LLM Integration**
   - Answer generation
   - Content summarization
   - SEO recommendations

**Technology Stack:**
- FastAPI
- Python 3.11+
- PyTorch
- Transformers
- LangChain
- Sentence Transformers

## Data Flow

### Search Query Flow

1. User enters search query in frontend
2. Frontend sends request to Backend API
3. Backend processes query:
   - Spell correction
   - Query expansion
   - Intent detection
4. Backend queries OpenSearch
5. Results are ranked using:
   - BM25 score
   - PageRank
   - AI relevance score
   - User signals
6. For AI answers, backend calls AI service
7. Results returned to frontend
8. Frontend renders results

### Crawler Flow

1. Crawl job created in database
2. Queue worker picks up job
3. CrawlerService fetches robots.txt
4. Pages crawled recursively
5. Content extracted and stored
6. Indexer creates search documents
7. Documents indexed in OpenSearch

### Website Submission Flow

1. User submits website URL
2. System validates URL
3. Verification token generated
4. User adds verification to site
5. System verifies ownership
6. Crawl job created
7. Site indexed
8. Webmaster dashboard populated

## Database Schema

### Core Tables

**users**
- id, email, password, role, avatar, email_verified_at, last_login_at, is_active

**websites**
- id, user_id, domain, url, sitemap_url, status, verified, verification_token, verified_at

**crawl_jobs**
- id, url, domain, status, priority, depth, max_depth, follow_links, respect_robots_txt, started_at, completed_at

**crawl_pages**
- id, crawl_job_id, url, domain, status_code, title, meta_description, html_content, text_content, language, word_count, crawled_at

**search_documents**
- id, crawl_page_id, url, domain, title, content, meta_description, language, page_rank, bm25_score, ai_score, freshness_score, authority_score

**search_analytics**
- id, document_id, query, position, clicked, created_at

**seo_analyses**
- id, user_id, url, score, title_issues, meta_issues, heading_issues, recommendations, analyzed_at

## Security Measures

### Application Security
- CSRF Protection
- XSS Prevention
- SQL Injection Protection
- Rate Limiting
- JWT Authentication
- Input Validation
- Output Encoding

### Infrastructure Security
- HTTPS/TLS Encryption
- WAF Support
- DDoS Protection
- Network Segmentation
- Secrets Management

### Data Security
- Password Hashing (bcrypt)
- Token-based Authentication
- API Key Rotation
- Data Encryption at Rest

## Performance Optimization

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Service Worker caching
- CDN distribution

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Redis caching
- Queue workers

### Search
- Index sharding
- Replica nodes
- Query caching
- Result pagination

## Monitoring & Observability

### Metrics Collection
- Prometheus metrics
- Custom business metrics
- Performance counters

### Logging
- Structured logging (JSON)
- Log aggregation
- Error tracking

### Alerting
- Uptime monitoring
- Error rate alerts
- Performance degradation alerts

## Scalability

### Horizontal Scaling
- Stateless application servers
- Database read replicas
- Search cluster scaling
- Cache clustering

### Vertical Scaling
- Resource allocation
- Connection limits
- Memory optimization

## Deployment

### Development
- Docker Compose
- Hot reload enabled
- Debug mode

### Production
- Kubernetes orchestration
- Auto-scaling
- Rolling updates
- Health checks
- Resource quotas

## Future Enhancements

1. **Map Service** - Location-based search
2. **Email Service** - Secure email platform
3. **Cloud Storage** - File storage solution
4. **AI Chat** - Conversational interface
5. **Browser** - Custom web browser
6. **Translation** - Neural machine translation
7. **Shopping** - Product search and comparison
8. **Jobs** - Employment search portal
9. **Academic** - Research paper search
