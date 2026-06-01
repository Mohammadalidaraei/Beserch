<?php
/**
 * Main Entry Point
 * نقطه ورود اصلی برنامه
 */

// تنظیمات خطاگیری
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/logs/error.log');

// هدرهای امنیتی
require_once __DIR__ . '/Security.php';
Security::setSecurityHeaders();

// هدر JSON
header('Content-Type: application/json; charset=utf-8');

// بارگذاری Router
require_once __DIR__ . '/Router.php';

// ایجاد Router
$router = new Router();
$router->setBasePath('/api');

// ثبت Routeها
// Search
$router->get('/search', ['SearchController', 'search']);
$router->get('/search/suggest', ['SearchController', 'suggest']);
$router->get('/search/advanced', ['SearchController', 'advancedSearch']);

// SEO
$router->post('/seo/analyze', ['SeoController', 'analyze']);
$router->post('/seo/generate', ['SeoController', 'generate']);
$router->post('/seo/titles', ['SeoController', 'suggestTitles']);
$router->post('/seo/meta-description', ['SeoController', 'generateMetaDescription']);
$router->post('/seo/schema', ['SeoController', 'generateSchema']);

// Health Check
$router->get('/health', function() {
    echo json_encode([
        'success' => true,
        'status' => 'ok',
        'timestamp' => date('c'),
        'version' => '1.0.0'
    ]);
});

// پردازش درخواست
$router->dispatch();
