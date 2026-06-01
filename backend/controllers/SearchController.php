<?php
/**
 * Search Controller
 */

class SearchController {
    private $searchService;
    
    public function __construct() {
        require_once __DIR__ . '/../services/SearchService.php';
        $this->searchService = new SearchService();
    }
    
    /**
     * Web Search
     */
    public function search() {
        $query = sanitizeInput($_GET['q'] ?? '');
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, intval($_GET['limit'] ?? 10));
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query parameter is required'], 400);
        }
        
        try {
            $results = $this->searchService->search($query, $page, $limit);
            
            jsonResponse([
                'success' => true,
                'query' => $query,
                'page' => $page,
                'total' => $results['total'] ?? 0,
                'results' => $results['results'] ?? [],
                'time' => $results['time'] ?? 0
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Search failed: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Image Search
     */
    public function imageSearch() {
        $query = sanitizeInput($_GET['q'] ?? '');
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, intval($_GET['limit'] ?? 20));
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query parameter is required'], 400);
        }
        
        try {
            $results = $this->searchService->imageSearch($query, $page, $limit);
            
            jsonResponse([
                'success' => true,
                'query' => $query,
                'page' => $page,
                'total' => $results['total'] ?? 0,
                'results' => $results['results'] ?? []
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Image search failed: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Video Search
     */
    public function videoSearch() {
        $query = sanitizeInput($_GET['q'] ?? '');
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, intval($_GET['limit'] ?? 20));
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query parameter is required'], 400);
        }
        
        try {
            $results = $this->searchService->videoSearch($query, $page, $limit);
            
            jsonResponse([
                'success' => true,
                'query' => $query,
                'page' => $page,
                'total' => $results['total'] ?? 0,
                'results' => $results['results'] ?? []
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Video search failed: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * News Search
     */
    public function newsSearch() {
        $query = sanitizeInput($_GET['q'] ?? '');
        $page = max(1, intval($_GET['page'] ?? 1));
        $limit = min(100, intval($_GET['limit'] ?? 20));
        
        if (empty($query)) {
            jsonResponse(['error' => 'Query parameter is required'], 400);
        }
        
        try {
            $results = $this->searchService->newsSearch($query, $page, $limit);
            
            jsonResponse([
                'success' => true,
                'query' => $query,
                'page' => $page,
                'total' => $results['total'] ?? 0,
                'results' => $results['results'] ?? []
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'News search failed: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Search Suggestions
     */
    public function suggestions() {
        $query = sanitizeInput($_GET['q'] ?? '');
        
        if (empty($query) || strlen($query) < 2) {
            jsonResponse(['suggestions' => []]);
        }
        
        try {
            $suggestions = $this->searchService->getSuggestions($query);
            
            jsonResponse([
                'success' => true,
                'query' => $query,
                'suggestions' => $suggestions
            ]);
        } catch (Exception $e) {
            jsonResponse(['error' => 'Failed to get suggestions: ' . $e->getMessage()], 500);
        }
    }
}
