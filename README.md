# BSearch - Iranian Search Engine

## Project Overview

BSearch is a modern, AI-powered search engine designed specifically for the Persian web and Iranian users. It provides Google-like search capabilities with full support for Persian language, Finglish, Arabic, and English.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: TailwindCSS
- **Features**: SSR, SEO Optimized, PWA, RTL Support, Dark/Light Mode
- **Language**: TypeScript

### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.3
- **API**: REST API with JWT Authentication
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Search Engine**: OpenSearch (Elasticsearch Compatible)

### AI Services
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ML Libraries**: PyTorch, Transformers, LangChain
- **Features**: RAG System, Semantic Search, NLP for Persian

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Web Server**: Nginx
- **CDN**: Support for major CDN providers

## Core Modules

1. **Search Engine**
   - Web Crawler
   - Page Storage
   - Indexing System
   - Ranking Algorithm (BM25, PageRank, AI Ranking)
   - Semantic Search

2. **Search Types**
   - Web Search
   - Image Search
   - Video Search
   - News Search
   - AI Answer Search

3. **User Interfaces**
   - Google-like Search Page
   - Search Results Page
   - Image Search Gallery
   - Video Search Results
   - AI Search Interface
   - Website Submission Portal
   - SEO Assistant Tool
   - Webmaster Dashboard
   - Admin Panel

4. **AI Features**
   - AI Search Answers
   - AI SEO Generator
   - Spell Correction
   - Synonym Detection
   - Intent Detection
   - Entity Recognition

## Project Structure

```
bsearch/
├── backend/                 # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Providers/
│   ├── config/
│   ├── database/
│   ├── routes/
│   └── tests/
├── frontend/                # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   └── public/
├── ai_service/              # Python AI Service
│   ├── app/
│   ├── data/
│   └── tests/
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   └── nginx/
├── docs/
└── deployment/
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- PHP 8.3+
- Python 3.11+

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd bsearch
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Install Backend Dependencies**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

4. **Install Frontend Dependencies**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

5. **Install AI Service Dependencies**
```bash
cd ai_service
pip install -r requirements.txt
```

## Documentation

- [Architecture Documentation](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Development Guide](docs/development.md)
- [Security Guidelines](docs/security.md)

## License

Proprietary - All Rights Reserved

## Contact

For inquiries, please contact the development team.
