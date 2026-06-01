<?php
/**
 * Database Configuration
 */

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '5432');
define('DB_NAME', getenv('DB_NAME') ?: 'bsearch');
define('DB_USER', getenv('DB_USER') ?: 'bsearch');
define('DB_PASS', getenv('DB_PASS') ?: 'bsearch_secret');

define('REDIS_HOST', getenv('REDIS_HOST') ?: 'localhost');
define('REDIS_PORT', getenv('REDIS_PORT') ?: '6379');

define('OPENSEARCH_HOST', getenv('OPENSEARCH_HOST') ?: 'localhost');
define('OPENSEARCH_PORT', getenv('OPENSEARCH_PORT') ?: '9200');

define('AI_SERVICE_URL', getenv('AI_SERVICE_URL') ?: 'http://localhost:8001');

define('APP_DEBUG', getenv('APP_DEBUG') ?: 'false');
define('APP_SECRET', getenv('APP_SECRET') ?: 'change_this_secret_key');
