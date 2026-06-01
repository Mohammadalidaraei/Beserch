<?php
/**
 * Search Service
 * Handles search operations with OpenSearch/Elasticsearch
 */

class SearchService {
    private $config;
    private $opensearchHost;
    
    public function __construct() {
        $this->config = require __DIR__ . '/../config/config.php';
        $hosts = $this->config['opensearch']['hosts'];
        $this->opensearchHost = $hosts[0] ?? 'localhost:9200';
    }
    
    /**
     * Perform web search
     */
    public function search($query, $page = 1, $limit = 10) {
        $startTime = microtime(true);
        
        // Check Redis cache first
        $cacheKey = 'search:' . md5($query . ':' . $page . ':' . $limit);
        $cached = $this->getFromCache($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        // Prepare search query for OpenSearch
        $searchQuery = $this->buildSearchQuery($query);
        
        // Call OpenSearch API
        $response = $this->callOpenSearch('web', $searchQuery, $page, $limit);
        
        // Process results
        $results = $this->processResults($response, 'web');
        
        $endTime = microtime(true);
        $searchTime = round(($endTime - $startTime) * 1000, 2);
        
        $data = [
            'total' => $results['total'] ?? 0,
            'results' => $results['hits'] ?? [],
            'time' => $searchTime
        ];
        
        // Cache results
        $this->saveToCache($cacheKey, $data, 300); // 5 minutes
        
        return $data;
    }
    
    /**
     * Image search
     */
    public function imageSearch($query, $page = 1, $limit = 20) {
        $searchQuery = $this->buildSearchQuery($query, ['type' => 'image']);
        $response = $this->callOpenSearch('images', $searchQuery, $page, $limit);
        
        $results = $this->processResults($response, 'image');
        
        return [
            'total' => $results['total'] ?? 0,
            'results' => $results['hits'] ?? []
        ];
    }
    
    /**
     * Video search
     */
    public function videoSearch($query, $page = 1, $limit = 20) {
        $searchQuery = $this->buildSearchQuery($query, ['type' => 'video']);
        $response = $this->callOpenSearch('videos', $searchQuery, $page, $limit);
        
        $results = $this->processResults($response, 'video');
        
        return [
            'total' => $results['total'] ?? 0,
            'results' => $results['hits'] ?? []
        ];
    }
    
    /**
     * News search
     */
    public function newsSearch($query, $page = 1, $limit = 20) {
        $searchQuery = $this->buildSearchQuery($query, ['type' => 'news']);
        $response = $this->callOpenSearch('news', $searchQuery, $page, $limit);
        
        $results = $this->processResults($response, 'news');
        
        return [
            'total' => $results['total'] ?? 0,
            'results' => $results['hits'] ?? []
        ];
    }
    
    /**
     * Get search suggestions
     */
    public function getSuggestions($query) {
        $cacheKey = 'suggestions:' . md5($query);
        $cached = $this->getFromCache($cacheKey);
        if ($cached) {
            return $cached;
        }
        
        // Get suggestions from database (popular searches)
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("
            SELECT suggestion 
            FROM search_suggestions 
            WHERE query LIKE :query 
            ORDER BY popularity DESC 
            LIMIT 10
        ");
        $stmt->execute(['query' => $query . '%']);
        $suggestions = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // If no suggestions from DB, generate from query
        if (empty($suggestions)) {
            $suggestions = $this->generateSuggestions($query);
        }
        
        $this->saveToCache($cacheKey, $suggestions, 3600);
        
        return $suggestions;
    }
    
    /**
     * Build search query for OpenSearch
     */
    private function buildSearchQuery($query, $options = []) {
        // Persian text normalization
        $normalizedQuery = $this->normalizePersianText($query);
        
        $searchQuery = [
            'query' => [
                'bool' => [
                    'should' => [
                        [
                            'match' => [
                                'title' => [
                                    'query' => $normalizedQuery,
                                    'boost' => 3
                                ]
                            ]
                        ],
                        [
                            'match' => [
                                'content' => [
                                    'query' => $normalizedQuery,
                                    'boost' => 1
                                ]
                            ]
                        ],
                        [
                            'match_phrase' => [
                                'title' => [
                                    'query' => $normalizedQuery,
                                    'boost' => 5
                                ]
                            ]
                        ]
                    ],
                    'minimum_should_match' => 1
                ]
            ],
            'highlight' => [
                'fields' => [
                    'title' => ['pre_tags' => ['<mark>'], 'post_tags' => ['</mark>']],
                    'content' => ['pre_tags' => ['<mark>'], 'post_tags' => ['</mark>']]
                ]
            ]
        ];
        
        // Add type filter if specified
        if (isset($options['type'])) {
            $searchQuery['query']['bool']['filter'][] = [
                'term' => ['type' => $options['type']]
            ];
        }
        
        return $searchQuery;
    }
    
    /**
     * Call OpenSearch API
     */
    private function callOpenSearch($index, $query, $page, $limit) {
        $indexName = $this->config['opensearch']['index_prefix'] . $index;
        $from = ($page - 1) * $limit;
        
        $url = "http://{$this->opensearchHost}/{$indexName}/_search";
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'query' => $query['query'],
            'highlight' => $query['highlight'] ?? null,
            'from' => $from,
            'size' => $limit,
            '_source' => true
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200 || !$response) {
            // Return empty results if OpenSearch is not available
            return ['hits' => ['total' => ['value' => 0], 'hits' => []]];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Process OpenSearch results
     */
    private function processResults($response, $type = 'web') {
        if (!isset($response['hits'])) {
            return ['total' => 0, 'hits' => []];
        }
        
        $total = $response['hits']['total']['value'] ?? 0;
        $hits = [];
        
        foreach ($response['hits']['hits'] ?? [] as $hit) {
            $source = $hit['_source'] ?? [];
            $highlight = $hit['highlight'] ?? [];
            
            $result = [
                'id' => $hit['_id'],
                'title' => $source['title'] ?? '',
                'url' => $source['url'] ?? '',
                'description' => $source['description'] ?? '',
                'snippet' => $this->extractSnippet($highlight, $source),
                'score' => $hit['_score'] ?? 0,
                'date' => $source['published_at'] ?? $source['created_at'] ?? null,
            ];
            
            // Add type-specific fields
            if ($type === 'image') {
                $result['thumbnail'] = $source['thumbnail_url'] ?? '';
                $result['width'] = $source['width'] ?? 0;
                $result['height'] = $source['height'] ?? 0;
                $result['source'] = $source['source_domain'] ?? '';
            } elseif ($type === 'video') {
                $result['thumbnail'] = $source['thumbnail_url'] ?? '';
                $result['duration'] = $source['duration'] ?? 0;
                $result['source'] = $source['source_domain'] ?? '';
            }
            
            $hits[] = $result;
        }
        
        return ['total' => $total, 'hits' => $hits];
    }
    
    /**
     * Extract snippet from highlights or content
     */
    private function extractSnippet($highlight, $source) {
        if (!empty($highlight['content'])) {
            return strip_tags(implode(' ', $highlight['content']));
        }
        
        $content = $source['content'] ?? '';
        if (strlen($content) > 200) {
            return mb_substr($content, 0, 200, 'UTF-8') . '...';
        }
        
        return $content;
    }
    
    /**
     * Normalize Persian text
     */
    private function normalizePersianText($text) {
        // Replace Arabic characters with Persian equivalents
        $arabicToPersian = [
            'ك' => 'ک',
            'ي' => 'ی',
            'أ' => 'ا',
            'إ' => 'ا',
            'آ' => 'ا',
            'ة' => 'ه',
            'ؤ' => 'و',
            'ئ' => 'ی',
            'ۀ' => 'ه',
            'پ' => 'پ',
            'چ' => 'چ',
            'ژ' => 'ژ',
            'گ' => 'گ',
        ];
        
        $text = strtr($text, $arabicToPersian);
        
        // Remove extra spaces
        $text = preg_replace('/\s+/', ' ', trim($text));
        
        return $text;
    }
    
    /**
     * Generate suggestions from query
     */
    private function generateSuggestions($query) {
        $words = explode(' ', $query);
        $suggestions = [];
        
        // Common Persian search patterns
        $patterns = [
            'چیست', 'کیست', 'کجاست', 'چگونه', 'چرا', 'چه زمانی',
            'آموزش', 'خرید', 'قیمت', 'بهترین', 'بررسی'
        ];
        
        foreach ($patterns as $pattern) {
            $suggestions[] = $query . ' ' . $pattern;
        }
        
        return array_slice($suggestions, 0, 10);
    }
    
    /**
     * Cache helpers
     */
    private function getFromCache($key) {
        $redis = new Redis();
        try {
            $redis->connect(
                $this->config['redis']['host'],
                $this->config['redis']['port']
            );
            $data = $redis->get($key);
            return $data ? json_decode($data, true) : false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    private function saveToCache($key, $data, $ttl = 300) {
        $redis = new Redis();
        try {
            $redis->connect(
                $this->config['redis']['host'],
                $this->config['redis']['port']
            );
            $redis->setex($key, $ttl, json_encode($data, JSON_UNESCAPED_UNICODE));
        } catch (Exception $e) {
            // Ignore cache errors
        }
    }
}
