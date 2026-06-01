<?php
/**
 * BSearch Configuration
 * تنظیمات اصلی برنامه
 */

return [
    // Application
    'app' => [
        'name' => 'BSearch',
        'version' => '1.0.0',
        'debug' => true,
        'timezone' => 'Asia/Tehran',
        'locale' => 'fa_IR',
        'url' => 'http://localhost:8000'
    ],

    // Database
    'database' => [
        'driver' => 'pgsql',
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: 5432,
        'database' => getenv('DB_NAME') ?: 'bsearch',
        'username' => getenv('DB_USER') ?: 'postgres',
        'password' => getenv('DB_PASS') ?: 'postgres',
        'charset' => 'utf8',
        'prefix' => ''
    ],

    // Redis
    'redis' => [
        'host' => getenv('REDIS_HOST') ?: 'localhost',
        'port' => getenv('REDIS_PORT') ?: 6379,
        'password' => getenv('REDIS_PASS') ?: null,
        'database' => 0
    ],

    // OpenSearch / Elasticsearch
    'opensearch' => [
        'hosts' => [
            getenv('OPENSEARCH_HOST') ?: 'localhost:9200'
        ],
        'index_prefix' => 'bsearch_'
    ],

    // AI Service
    'ai_service' => [
        'url' => getenv('AI_SERVICE_URL') ?: 'http://localhost:8001',
        'timeout' => 30
    ],

    // JWT Authentication
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'change-this-secret-key-in-production',
        'expires' => 3600 * 24 * 7, // 7 days
        'algorithm' => 'HS256'
    ],

    // Search Settings
    'search' => [
        'results_per_page' => 10,
        'max_results' => 100,
        'cache_ttl' => 3600, // 1 hour
        'suggestions_limit' => 10
    ],

    // Crawler Settings
    'crawler' => [
        'user_agent' => 'BSearchBot/1.0 (+https://bsearch.ir/bot)',
        'max_depth' => 5,
        'max_pages_per_domain' => 1000,
        'delay_between_requests' => 1000, // ms
        'timeout' => 30,
        'respect_robots_txt' => true,
        'allowed_mime_types' => ['text/html', 'application/xhtml+xml']
    ],

    // Rate Limiting
    'rate_limit' => [
        'enabled' => true,
        'requests_per_minute' => 60,
        'burst' => 10
    ],

    // Security
    'security' => [
        'csrf_enabled' => true,
        'xss_protection' => true,
        'sql_injection_protection' => true
    ],

    // Logging
    'logging' => [
        'enabled' => true,
        'level' => 'debug',
        'path' => __DIR__ . '/../logs/',
        'max_files' => 30
    ],

    // File Uploads
    'uploads' => [
        'max_size' => 10 * 1024 * 1024, // 10MB
        'allowed_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
        'path' => __DIR__ . '/../uploads/'
    ]
];
