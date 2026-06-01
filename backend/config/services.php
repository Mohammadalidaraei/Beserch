<?php

return [
    'url' => env('AI_SERVICE_URL', 'http://localhost:8001'),
    'api_key' => env('AI_SERVICE_API_KEY', ''),
    'timeout' => env('AI_SERVICE_TIMEOUT', 30),
    'max_tokens' => env('AI_SERVICE_MAX_TOKENS', 2048),
    'default_model' => env('AI_SERVICE_DEFAULT_MODEL', 'persian-llm-v1'),
    'embedding_model' => env('AI_SERVICE_EMBEDDING_MODEL', 'persian-embedding-v1'),
];
