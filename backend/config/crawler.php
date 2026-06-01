<?php

return [
    'user_agent' => env('CRAWLER_USER_AGENT', 'BSearchBot/1.0 (+http://localhost:8000/bot)'),
    'max_pages_per_site' => env('CRAWLER_MAX_PAGES_PER_SITE', 1000),
    'delay_ms' => env('CRAWLER_DELAY_MS', 1000),
    'max_depth' => env('CRAWLER_MAX_DEPTH', 5),
    'timeout_seconds' => env('CRAWLER_TIMEOUT', 30),
    'concurrent_requests' => env('CRAWLER_CONCURRENT', 5),
    'allowed_mime_types' => [
        'text/html',
        'application/xhtml+xml',
    ],
    'blocked_paths' => [
        '/admin',
        '/wp-admin',
        '/login',
        '/logout',
        '/register',
        '/signin',
        '/signup',
    ],
];
