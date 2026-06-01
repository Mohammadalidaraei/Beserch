<?php
/**
 * BSearch Backend - Entry Point
 * موتور جستجوی ایرانی - بک‌اند PHP خام
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load configuration
require_once __DIR__ . '/../config/config.php';

// Autoloader
spl_autoload_register(function ($class) {
    $paths = [
        __DIR__ . '/../src/',
        __DIR__ . '/../src/Controllers/',
        __DIR__ . '/../src/Models/',
        __DIR__ . '/../src/Services/',
        __DIR__ . '/../src/Helpers/',
        __DIR__ . '/../src/Middleware/'
    ];
    
    foreach ($paths as $path) {
        $file = $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Load core classes
require_once __DIR__ . '/../src/Request.php';
require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/Router.php';
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Auth.php';

use Router;
use Request;
use Response;

// Initialize router
$router = new Router();

// ==================== Public Routes ====================

// Search endpoints
$router->get('/api/search', 'SearchController@search');
$router->get('/api/suggestions', 'SearchController@suggestions');
$router->post('/api/voice-search', 'SearchController@voiceSearch');

// Auth endpoints
$router->post('/api/auth/register', 'AuthController@register');
$router->post('/api/auth/login', 'AuthController@login');
$router->post('/api/auth/logout', 'AuthController@logout');
$router->get('/api/auth/me', 'AuthController@me');

// Webmaster endpoints
$router->post('/api/webmaster/submit', 'WebmasterController@submit');
$router->get('/api/webmaster/stats/{id}', 'WebmasterController@stats');
$router->get('/api/webmaster/pages/{id}', 'WebmasterController@pages');
$router->get('/api/webmaster/errors/{id}', 'WebmasterController@errors');
$router->post('/api/webmaster/sitemap/{id}', 'WebmasterController@submitSitemap');

// SEO Tool endpoints
$router->post('/api/seo/analyze', 'SEOController@analyze');
$router->post('/api/seo/generate-fixes', 'SEOController@generateFixes');
$router->post('/api/seo/generate-meta', 'SEOController@generateMeta');
$router->get('/api/seo/web-vitals', 'SEOController@webVitals');

// Admin endpoints
$router->get('/api/admin/stats', 'AdminController@stats');
$router->post('/api/admin/crawl', 'AdminController@crawl');
$router->post('/api/admin/index', 'AdminController@index');
$router->get('/api/admin/logs', 'AdminController@logs');

// ==================== Route Handling ====================

$request = new Request();
$response = new Response();

try {
    $result = $router->dispatch($request);
    $response->json($result);
} catch (\Exception $e) {
    $response->json([
        'success' => false,
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], 500);
}
