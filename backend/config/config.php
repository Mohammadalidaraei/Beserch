<?php
/**
 * BSearch Configuration
 */

return [
    'app' => [
        'name' => 'BSearch',
        'version' => '1.0.0',
        'debug' => getenv('APP_DEBUG') ?: false,
        'url' => getenv('APP_URL') ?: 'http://localhost:8000',
        'timezone' => 'Asia/Tehran',
        'locale' => 'fa',
    ],

    'db' => [
        'driver' => 'pgsql',
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: 5432,
        'database' => getenv('DB_DATABASE') ?: 'bsearch',
        'username' => getenv('DB_USERNAME') ?: 'postgres',
        'password' => getenv('DB_PASSWORD') ?: 'postgres',
        'charset' => 'utf8',
        'prefix' => '',
    ],

    'redis' => [
        'host' => getenv('REDIS_HOST') ?: 'localhost',
        'port' => getenv('REDIS_PORT') ?: 6379,
        'password' => getenv('REDIS_PASSWORD') ?: null,
        'database' => getenv('REDIS_DATABASE') ?: 0,
    ],

    'opensearch' => [
        'hosts' => [
            getenv('OPENSEARCH_HOST') ?: 'localhost:9200'
        ],
        'index_prefix' => 'bsearch_',
    ],

    'ai_service' => [
        'url' => getenv('AI_SERVICE_URL') ?: 'http://localhost:8001',
        'timeout' => 30,
    ],

    'auth' => [
        'jwt_secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production',
        'jwt_expire' => 86400, // 24 hours
    ],

    'crawler' => [
        'user_agent' => 'BSearch Bot/1.0 (+https://bsearch.ir/bot)',
        'max_pages_per_domain' => 1000,
        'crawl_delay' => 1, // seconds
        'timeout' => 30,
        'max_depth' => 5,
        'allowed_domains' => ['*.ir', '*.iran'],
        'respect_robots_txt' => true,
    ],

    'search' => [
        'results_per_page' => 10,
        'max_results' => 100,
        'min_word_length' => 2,
        'highlight_pre_tag' => '<mark>',
        'highlight_post_tag' => '</mark>',
    ],

    'cache' => [
        'default' => 'redis',
        'ttl' => 3600, // 1 hour
    ],

    'security' => [
        'rate_limit' => 100, // requests per hour
        'csrf_protection' => true,
        'xss_protection' => true,
        'sql_injection_protection' => true,
    ],

    'logging' => [
        'level' => getenv('LOG_LEVEL') ?: 'error',
        'path' => __DIR__ . '/../storage/logs/',
    ],
];
