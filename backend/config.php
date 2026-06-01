<?php
/**
 * BSearch Configuration
 * تنظیمات اصلی سیستم
 */

return [
    'app' => [
        'name' => 'BSearch',
        'url' => 'http://localhost:8000',
        'debug' => true,
        'timezone' => 'Asia/Tehran',
        'locale' => 'fa_IR',
    ],
    
    'database' => [
        'driver' => 'pgsql', // یا mysql
        'host' => '127.0.0.1',
        'port' => '5432',
        'database' => 'bsearch_db',
        'username' => 'bsearch_user',
        'password' => 'secure_password',
        'charset' => 'utf8',
        'collation' => 'utf8_unicode_ci',
    ],

    'redis' => [
        'host' => '127.0.0.1',
        'port' => '6379',
        'password' => null,
        'database' => 0,
    ],

    'opensearch' => [
        'hosts' => ['localhost:9200'],
        'index_prefix' => 'bsearch_',
    ],

    'ai_service' => [
        'url' => 'http://127.0.0.1:8001',
        'timeout' => 30,
    ],

    'crawler' => [
        'user_agent' => 'BSearchBot/1.0 (+https://bsearch.ir/bot)',
        'max_depth' => 5,
        'delay' => 1, // ثانیه بین درخواست‌ها
        'allowed_domains' => [], // خالی یعنی همه
    ],

    'security' => [
        'csrf_key' => 'CHANGE_THIS_TO_RANDOM_STRING',
        'jwt_secret' => 'CHANGE_THIS_TO_RANDOM_SECRET_KEY',
        'hash_cost' => 12,
    ],
];
