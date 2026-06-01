<?php
/**
 * API Routes
 */

// Health Check
$router->get('/', function() {
    jsonResponse([
        'status' => 'ok',
        'message' => 'BSearch API v1.0',
        'timestamp' => date('c')
    ]);
});

// Search Endpoints
$router->get('/search', 'SearchController@search');
$router->get('/search/images', 'SearchController@imageSearch');
$router->get('/search/videos', 'SearchController@videoSearch');
$router->get('/search/news', 'SearchController@newsSearch');
$router->get('/search/suggestions', 'SearchController@suggestions');

// AI Search
$router->post('/ai/search', 'AIController@search');
$router->get('/ai/answer', 'AIController@getAnswer');

// SEO Assistant
$router->post('/seo/analyze', 'SEOController@analyze');
$router->post('/seo/generate-fixes', 'SEOController@generateFixes');

// Webmaster
$router->post('/webmaster/submit', 'WebmasterController@submit');
$router->get('/webmaster/stats/{id}', 'WebmasterController@stats');
$router->get('/webmaster/sites', 'WebmasterController@getSites');

// Authentication
$router->post('/auth/register', 'AuthController@register');
$router->post('/auth/login', 'AuthController@login');
$router->post('/auth/logout', 'AuthController@logout');
$router->get('/auth/me', 'AuthController@me');
$router->post('/auth/refresh', 'AuthController@refresh');

// Admin (protected)
$router->get('/admin/crawl/jobs', 'AdminController@crawlingJobs');
$router->post('/admin/crawl/start', 'AdminController@startCrawl');
$router->get('/admin/index/stats', 'AdminController@indexStats');
