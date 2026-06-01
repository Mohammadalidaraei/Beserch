-- BSearch Database Schema (PostgreSQL)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Websites (for webmaster tools)
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    url VARCHAR(512) NOT NULL,
    verification_token VARCHAR(64),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crawl jobs
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id SERIAL PRIMARY KEY,
    url VARCHAR(512) NOT NULL,
    sitemap_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Crawl queue
CREATE TABLE IF NOT EXISTS crawl_queue (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES crawl_jobs(id),
    url VARCHAR(512) NOT NULL,
    priority DECIMAL(3,2) DEFAULT 0.5,
    status VARCHAR(50) DEFAULT 'pending',
    attempts INTEGER DEFAULT 0,
    lastmod TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crawled pages
CREATE TABLE IF NOT EXISTS crawl_pages (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES crawl_jobs(id),
    url VARCHAR(512) NOT NULL,
    title TEXT,
    content TEXT,
    meta_description TEXT,
    headers JSONB,
    links JSONB,
    images JSONB,
    status_code INTEGER,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search documents (main index)
CREATE TABLE IF NOT EXISTS search_documents (
    id SERIAL PRIMARY KEY,
    url VARCHAR(512) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'web',
    thumbnail VARCHAR(512),
    duration INTEGER,
    published_at TIMESTAMP,
    pagerank DECIMAL(5,4) DEFAULT 0.5,
    indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_search_documents_content 
ON search_documents USING gin(to_tsvector('simple', content || ' ' || title));

CREATE INDEX IF NOT EXISTS idx_search_documents_type 
ON search_documents(content_type);

CREATE INDEX IF NOT EXISTS idx_search_documents_pagerank 
ON search_documents(pagerank DESC);

-- Search suggestions
CREATE TABLE IF NOT EXISTS search_suggestions (
    id SERIAL PRIMARY KEY,
    suggestion VARCHAR(255) NOT NULL,
    popularity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suggestions_text 
ON search_suggestions(suggestion);

-- Related searches
CREATE TABLE IF NOT EXISTS search_related (
    id SERIAL PRIMARY KEY,
    original_query VARCHAR(255) NOT NULL,
    related_query VARCHAR(255) NOT NULL,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_related_original 
ON search_related(original_query);

-- SEO analysis results
CREATE TABLE IF NOT EXISTS seo_analyses (
    id SERIAL PRIMARY KEY,
    url VARCHAR(512) NOT NULL,
    score INTEGER,
    issues JSONB,
    suggestions JSONB,
    generated_fixes JSONB,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI query logs
CREATE TABLE IF NOT EXISTS ai_queries (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    response TEXT,
    sources JSONB,
    confidence DECIMAL(3,2),
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Search analytics
CREATE TABLE IF NOT EXISTS search_analytics (
    id SERIAL PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    results_count INTEGER,
    clicked_url VARCHAR(512),
    position INTEGER,
    user_agent TEXT,
    ip_address INET,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_query 
ON search_analytics(query);

CREATE INDEX IF NOT EXISTS idx_analytics_date 
ON search_analytics(searched_at);
