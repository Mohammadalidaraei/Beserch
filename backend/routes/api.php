<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WebmasterController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\AiController;
use App\Http\Controllers\SubmissionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::get('/search', [SearchController::class, 'search']);
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
Route::get('/search/images', [SearchController::class, 'imageSearch']);
Route::get('/search/videos', [SearchController::class, 'videoSearch']);
Route::get('/search/news', [SearchController::class, 'newsSearch']);
Route::post('/search/ai', [AiController::class, 'search']);
Route::post('/ai/feedback', [AiController::class, 'feedback']);

// Website submission
Route::post('/submit', [SubmissionController::class, 'submit']);
Route::get('/submit/status/{id}', [SubmissionController::class, 'status']);

// SEO tools
Route::post('/seo/analyze', [SeoController::class, 'analyze']);
Route::post('/seo/generate', [SeoController::class, 'generate']);
Route::get('/seo/report/{id}', [SeoController::class, 'report']);

// Authentication
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::post('/auth/refresh', [AuthController::class, 'refresh'])->middleware('auth:sanctum');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Webmaster routes
    Route::prefix('webmaster')->group(function () {
        Route::get('/websites', [WebmasterController::class, 'index']);
        Route::post('/websites', [WebmasterController::class, 'store']);
        Route::get('/websites/{id}', [WebmasterController::class, 'show']);
        Route::put('/websites/{id}', [WebmasterController::class, 'update']);
        Route::delete('/websites/{id}', [WebmasterController::class, 'destroy']);
        Route::post('/websites/{id}/verify', [WebmasterController::class, 'verify']);
        Route::post('/websites/{id}/crawl', [WebmasterController::class, 'crawl']);
        
        Route::get('/websites/{id}/stats', [WebmasterController::class, 'stats']);
        Route::get('/websites/{id}/performance', [WebmasterController::class, 'performance']);
        Route::get('/websites/{id}/errors', [WebmasterController::class, 'errors']);
        Route::get('/websites/{id}/pages', [WebmasterController::class, 'pages']);
        Route::get('/websites/{id}/queries', [WebmasterController::class, 'queries']);
        
        Route::get('/websites/{id}/sitemap', [WebmasterController::class, 'sitemap']);
        Route::post('/websites/{id}/sitemap', [WebmasterController::class, 'submitSitemap']);
    });

    // User profile
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'updatePassword']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'role:admin|super_admin'])->prefix('admin')->group(function () {
    Route::get('/stats', [App\Http\Controllers\Admin\DashboardController::class, 'stats']);
    Route::get('/users', [App\Http\Controllers\Admin\UserController::class, 'index']);
    Route::get('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'show']);
    Route::put('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'update']);
    Route::delete('/users/{id}', [App\Http\Controllers\Admin\UserController::class, 'destroy']);
    
    Route::get('/websites', [App\Http\Controllers\Admin\WebsiteController::class, 'index']);
    Route::get('/websites/{id}', [App\Http\Controllers\Admin\WebsiteController::class, 'show']);
    Route::delete('/websites/{id}', [App\Http\Controllers\Admin\WebsiteController::class, 'destroy']);
    
    Route::get('/crawls', [App\Http\Controllers\Admin\CrawlController::class, 'index']);
    Route::post('/crawls/{id}/retry', [App\Http\Controllers\Admin\CrawlController::class, 'retry']);
    Route::get('/crawls/{id}/logs', [App\Http\Controllers\Admin\CrawlController::class, 'logs']);
    
    Route::get('/search-queries', [App\Http\Controllers\Admin\SearchQueryController::class, 'index']);
    Route::get('/ai-responses', [App\Http\Controllers\Admin\AiResponseController::class, 'index']);
    
    Route::post('/opensearch/reindex', [App\Http\Controllers\Admin\IndexController::class, 'reindex']);
    Route::post('/opensearch/optimize', [App\Http\Controllers\Admin\IndexController::class, 'optimize']);
    Route::get('/opensearch/stats', [App\Http\Controllers\Admin\IndexController::class, 'stats']);
});
