<?php
/**
 * Search Controller
 * کنترلر جستجو
 */

require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../OpenSearchClient.php';
require_once __DIR__ . '/../AiClient.php';
require_once __DIR__ . '/../Security.php';
require_once __DIR__ . '/../RedisClient.php';

class SearchController {
    private $db;
    private $opensearch;
    private $aiClient;
    private $redis;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->opensearch = OpenSearchClient::getInstance();
        $this->aiClient = AiClient::getInstance();
        $this->redis = RedisClient::getInstance();
    }

    /**
     * جستجوی وب
     * GET /api/search
     */
    public function search() {
        // بررسی Rate Limit
        $ip = Security::getUserIp();
        if (!Security::checkRateLimit("search:{$ip}", 60, 60)) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Too Many Requests',
                'message' => 'لطفاً کمی صبر کنید'
            ]);
            return;
        }

        $query = isset($_GET['q']) ? trim($_GET['q']) : '';
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? min(50, max(1, intval($_GET['limit']))) : 10;
        $category = isset($_GET['category']) ? $_GET['category'] : 'web';
        $language = isset($_GET['lang']) ? $_GET['lang'] : 'fa';

        if (empty($query)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'جستجو خالی است'
            ]);
            return;
        }

        // تصحیح املایی با AI
        $spellingResult = $this->aiClient->correctSpelling($query);
        $correctedQuery = $query;
        if ($spellingResult['success'] && !empty($spellingResult['data']['corrected'])) {
            $correctedQuery = $spellingResult['data']['corrected'];
        }

        // تشخیص نیت کاربر
        $intentResult = $this->aiClient->detectIntent($query);
        $intent = $intentResult['success'] ? ($intentResult['data']['intent'] ?? 'search') : 'search';

        // جستجو در OpenSearch
        $from = ($page - 1) * $limit;
        $filters = [
            'language' => $language,
            'category' => $category
        ];

        $searchResult = $this->opensearch->search('documents', $correctedQuery, $filters, $from, $limit);

        if (!$searchResult['status'] || $searchResult['status'] >= 400) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Search Error',
                'message' => 'خطا در جستجو'
            ]);
            return;
        }

        $hits = $searchResult['body']['hits'] ?? [];
        $total = $hits['total']['value'] ?? 0;

        // ذخیره کوئری برای آمار
        $this->saveSearchQuery($query, $correctedQuery, $total, $ip);

        // فرمت‌دهی نتایج
        $results = [];
        foreach ($hits['hits'] ?? [] as $hit) {
            $result = [
                'id' => $hit['_id'],
                'title' => $hit['_source']['title'] ?? '',
                'url' => $hit['_source']['url'] ?? '',
                'description' => $this->extractSnippet($hit),
                'domain' => parse_url($hit['_source']['url'] ?? '', PHP_URL_HOST),
                'language' => $hit['_source']['language'] ?? 'fa',
                'category' => $hit['_source']['category'] ?? 'web',
                'score' => $hit['_score'] ?? 0,
                'pageRank' => $hit['_source']['page_rank'] ?? 0,
                'publishedAt' => $hit['_source']['published_at'] ?? null,
                'highlight' => $hit['highlight'] ?? []
            ];

            // افزودن اطلاعات خاص بر اساس دسته‌بندی
            if ($category === 'image') {
                $result['imageUrl'] = $hit['_source']['image_url'] ?? '';
                $result['thumbnailUrl'] = $hit['_source']['thumbnail_url'] ?? '';
                $result['width'] = $hit['_source']['width'] ?? 0;
                $result['height'] = $hit['_source']['height'] ?? 0;
            } elseif ($category === 'video') {
                $result['thumbnailUrl'] = $hit['_source']['thumbnail_url'] ?? '';
                $result['duration'] = $hit['_source']['video_duration'] ?? 0;
                $result['source'] = $hit['_source']['source'] ?? '';
            } elseif ($category === 'news') {
                $result['source'] = $hit['_source']['source'] ?? '';
                $result['author'] = $hit['_source']['author'] ?? '';
            }

            $results[] = $result;
        }

        // پیشنهاد کلمات مرتبط
        $relatedQueries = $this->getRelatedQueries($query);

        // اگر نیت کاربر سوال است، پاسخ AI تولید کن
        $aiAnswer = null;
        if ($intent === 'question' || strpos($query, '?') !== false || strpos($query, 'چیست') !== false) {
            $context = array_slice(array_column($results, 'description'), 0, 3);
            $aiResult = $this->aiClient->generateAnswer($query, $context);
            
            if ($aiResult['success']) {
                $aiAnswer = [
                    'answer' => $aiResult['data']['answer'] ?? '',
                    'sources' => array_slice($results, 0, 3),
                    'confidence' => $aiResult['data']['confidence'] ?? 0.8
                ];
            }
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'query' => $query,
                'correctedQuery' => $correctedQuery !== $query ? $correctedQuery : null,
                'totalResults' => $total,
                'page' => $page,
                'limit' => $limit,
                'totalPages' => ceil($total / $limit),
                'results' => $results,
                'aiAnswer' => $aiAnswer,
                'relatedQueries' => $relatedQueries,
                'searchTime' => ($searchResult['body']['took'] ?? 0) / 1000
            ]
        ]);
    }

    /**
     * دریافت پیشنهادات جستجو
     * GET /api/search/suggest
     */
    public function suggest() {
        $query = isset($_GET['q']) ? trim($_GET['q']) : '';

        if (empty($query) || strlen($query) < 2) {
            echo json_encode(['success' => true, 'data' => ['suggestions' => []]]);
            return;
        }

        // بررسی کش
        $cacheKey = "suggest:{$query}";
        if ($this->redis->isConnected()) {
            $cached = $this->redis->get($cacheKey);
            if ($cached) {
                echo json_encode(['success' => true, 'data' => json_decode($cached, true)]);
                return;
            }
        }

        // دریافت پیشنهادات از OpenSearch
        $suggestResult = $this->opensearch->suggest('documents', $query, 5);
        
        $suggestions = [];
        if ($suggestResult['status'] && isset($suggestResult['body']['suggest']['query-suggest'][0]['options'])) {
            foreach ($suggestResult['body']['suggest']['query-suggest'][0]['options'] as $option) {
                $suggestions[] = [
                    'text' => $option['text'],
                    'score' => $option['_score'] ?? 0
                ];
            }
        }

        // اگر پیشنهادی نبود، از کوئری‌های محبوب استفاده کن
        if (empty($suggestions)) {
            $suggestions = $this->getPopularQueries($query);
        }

        $data = ['suggestions' => $suggestions];

        // ذخیره در کش
        if ($this->redis->isConnected()) {
            $this->redis->set($cacheKey, json_encode($data), 300);
        }

        echo json_encode(['success' => true, 'data' => $data]);
    }

    /**
     * جستجوی پیشرفته
     * GET /api/search/advanced
     */
    public function advancedSearch() {
        $params = $_GET;
        
        // پیاده‌سازی جستجوی پیشرفته با فیلترهای مختلف
        // این متد می‌تواند گسترش یابد
        
        $this->search();
    }

    /**
     * ذخیره کوئری جستجو
     */
    private function saveSearchQuery($query, $normalizedQuery, $resultsCount, $userIp) {
        $this->db->insert('search_queries', [
            'query_text' => $query,
            'normalized_query' => $normalizedQuery,
            'results_count' => $resultsCount,
            'user_ip' => $userIp,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
    }

    /**
     * استخراج اسنیپت از نتیجه
     */
    private function extractSnippet($hit) {
        if (isset($hit['highlight']['content']) && !empty($hit['highlight']['content'])) {
            return strip_tags($hit['highlight']['content'][0]);
        }
        
        if (isset($hit['highlight']['title']) && !empty($hit['highlight']['title'])) {
            return strip_tags($hit['highlight']['title'][0]);
        }

        $content = $hit['_source']['meta_description'] ?? $hit['_source']['content'] ?? '';
        return mb_substr(strip_tags($content), 0, 160) . '...';
    }

    /**
     * دریافت کوئری‌های مرتبط
     */
    private function getRelatedQueries($query) {
        // استفاده از AI برای یافتن کوئری‌های مرتبط
        $result = $this->aiClient->extractKeywords($query, 5);
        
        if ($result['success'] && !empty($result['data']['keywords'])) {
            return array_map(function($kw) {
                return $kw['text'];
            }, $result['data']['keywords']);
        }

        return [];
    }

    /**
     * دریافت کوئری‌های محبوب
     */
    private function getPopularQueries($prefix) {
        $sql = "SELECT query_text, COUNT(*) as count 
                FROM search_queries 
                WHERE normalized_query LIKE :prefix 
                GROUP BY query_text 
                ORDER BY count DESC 
                LIMIT 5";
        
        $stmt = $this->db->query($sql, ['prefix' => $prefix . '%']);
        return $stmt ? $stmt->fetchAll() : [];
    }
}
