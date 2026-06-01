-- BSearch Database Schema
-- ساختار پایگاه داده

-- کاربران
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- user, webmaster, admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- وبسایت‌های ثبت‌شده
CREATE TABLE IF NOT EXISTS websites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    url VARCHAR(512) NOT NULL,
    sitemap_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'pending', -- pending, crawling, indexed, error
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- وظایف خزش
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    url VARCHAR(512) NOT NULL,
    depth INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    priority INTEGER DEFAULT 5,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- صفحات خزش‌شده
CREATE TABLE IF NOT EXISTS crawl_pages (
    id SERIAL PRIMARY KEY,
    website_id INTEGER REFERENCES websites(id) ON DELETE CASCADE,
    url VARCHAR(512) UNIQUE NOT NULL,
    title VARCHAR(512),
    content TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    language VARCHAR(10) DEFAULT 'fa',
    content_type VARCHAR(100),
    status_code INTEGER,
    headers TEXT,
    links_from JSONB,
    images JSONB,
    schema_data JSONB,
    page_rank REAL DEFAULT 0,
    last_crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس جستجو (متادیتا برای OpenSearch)
CREATE TABLE IF NOT EXISTS search_documents (
    id SERIAL PRIMARY KEY,
    page_id INTEGER REFERENCES crawl_pages(id) ON DELETE CASCADE,
    title_vector TSVECTOR,
    content_vector TSVECTOR,
    combined_vector TSVECTOR,
    category VARCHAR(50) DEFAULT 'web', -- web, image, video, news
    tags JSONB,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    last_searched_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- کوئری‌های جستجو
CREATE TABLE IF NOT EXISTS search_queries (
    id SERIAL PRIMARY KEY,
    query_text VARCHAR(512) NOT NULL,
    normalized_query VARCHAR(512),
    results_count INTEGER DEFAULT 0,
    user_ip INET,
    user_agent TEXT,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- کلیک‌های نتایج جستجو
CREATE TABLE IF NOT EXISTS search_clicks (
    id SERIAL PRIMARY KEY,
    query_id INTEGER REFERENCES search_queries(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES search_documents(id) ON DELETE CASCADE,
    position INTEGER,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- تحلیل‌های سئو
CREATE TABLE IF NOT EXISTS seo_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    url VARCHAR(512) NOT NULL,
    score INTEGER DEFAULT 0,
    issues JSONB,
    suggestions JSONB,
    generated_fixes JSONB,
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- توکن‌های JWT
CREATE TABLE IF NOT EXISTS jwt_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- تنظیمات سیستم
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    type VARCHAR(50) DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- لاگ‌های سیستم
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) DEFAULT 'info', -- debug, info, warning, error, critical
    message TEXT,
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس‌ها برای بهبود عملکرد
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON websites(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_scheduled ON crawl_jobs(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_url ON crawl_pages(url);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_language ON crawl_pages(language);
CREATE INDEX IF NOT EXISTS idx_search_documents_category ON search_documents(category);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_text ON search_queries(query_text);
CREATE INDEX IF NOT EXISTS idx_search_queries_searched_at ON search_queries(searched_at);
CREATE INDEX IF NOT EXISTS idx_seo_analyses_url ON seo_analyses(url);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- ایندکس全文 برای جستجوی داخلی
CREATE INDEX IF NOT EXISTS idx_crawl_pages_title ON crawl_pages USING gin(title_vector);
CREATE INDEX IF NOT EXISTS idx_crawl_pages_content ON crawl_pages USING gin(content_vector);

-- Trigger برای به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crawl_pages_updated_at BEFORE UPDATE ON crawl_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
