<?php

return [
    'host' => env('OPENSEARCH_HOST', 'localhost:9200'),
    'username' => env('OPENSEARCH_USERNAME', 'admin'),
    'password' => env('OPENSEARCH_PASSWORD', 'admin'),
    'index_prefix' => env('OPENSEARCH_INDEX_PREFIX', 'bsearch_'),
    'ssl_verification' => env('OPENSEARCH_SSL_VERIFY', false),
];
