<?php
/**
 * BSearch Core Router & Entry Point
 * PHP 8.3 Pure Implementation
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/SearchEngine.php';
require_once __DIR__ . '/Crawler.php';
require_once __DIR__ . '/AIConnector.php';

// Header Setup for API
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = new Database();
    $searchEngine = new SearchEngine($db);
    $crawler = new Crawler($db);
    $aiConnector = new AIConnector();

    switch ($uri) {
        case '/api/search':
            if ($method === 'GET') {
                $query = $_GET['q'] ?? '';
                $type = $_GET['type'] ?? 'web'; // web, image, video, news
                $page = (int)($_GET['page'] ?? 1);
                
                $results = $searchEngine->search($query, $type, $page);
                echo json_encode(['success' => true, 'data' => $results]);
            }
            break;

        case '/api/submit':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $url = $input['url'] ?? '';
                $sitemap = $input['sitemap'] ?? '';
                
                if ($url) {
                    $jobId = $crawler->addJob($url, $sitemap);
                    echo json_encode(['success' => true, 'job_id' => $jobId, 'message' => 'Crawl job added']);
                } else {
                    throw new Exception('URL is required');
                }
            }
            break;

        case '/api/ai/answer':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $query = $input['q'] ?? '';
                $context = $searchEngine->getTopContext($query, 5); // Get top 5 docs
                
                $aiResponse = $aiConnector->generateAnswer($query, $context);
                echo json_encode(['success' => true, 'data' => $aiResponse]);
            }
            break;

        case '/api/seo/analyze':
            if ($method === 'POST') {
                $input = json_decode(file_get_contents('php://input'), true);
                $url = $input['url'] ?? '';
                
                if ($url) {
                    $analysis = $searchEngine->analyzeSEO($url);
                    echo json_encode(['success' => true, 'data' => $analysis]);
                }
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Endpoint not found']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
