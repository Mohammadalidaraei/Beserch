<?php
/**
 * Search Engine Core Class
 * Implements BM25, PageRank, and Semantic Search
 */

class SearchEngine {
    private $db;
    private $opensearchHost;
    private $opensearchPort;

    public function __construct($db) {
        $this->db = $db;
        $this->opensearchHost = OPENSEARCH_HOST;
        $this->opensearchPort = OPENSEARCH_PORT;
    }

    /**
     * Main search function
     */
    public function search($query, $type = 'web', $page = 1) {
        $perPage = 10;
        $offset = ($page - 1) * $perPage;

        // Normalize query (Persian/English/Arabic support)
        $normalizedQuery = $this->normalizeText($query);
        $keywords = explode(' ', $normalizedQuery);

        // Check Redis cache first
        $cacheKey = "search:" . md5($query . $type . $page);
        if ($this->db->getRedis()) {
            $cached = $this->db->getRedis()->get($cacheKey);
            if ($cached) {
                return json_decode($cached, true);
            }
        }

        // Search in PostgreSQL with BM25-like scoring
        $results = $this->searchDatabase($normalizedQuery, $type, $perPage, $offset);

        // If not enough results, try OpenSearch
        if (count($results) < $perPage) {
            $osResults = $this->searchOpenSearch($query, $type, $perPage - count($results), $offset);
            $results = array_merge($results, $osResults);
        }

        // Apply ranking adjustments (PageRank + User Signals)
        $results = $this->applyRanking($results, $query);

        // Cache results for 5 minutes
        if ($this->db->getRedis()) {
            $this->db->getRedis()->setex($cacheKey, 300, json_encode($results));
        }

        return [
            'query' => $query,
            'type' => $type,
            'page' => $page,
            'total' => count($results),
            'results' => $results,
            'suggestions' => $this->getSuggestions($query),
            'related_searches' => $this->getRelatedSearches($query)
        ];
    }

    /**
     * Search in PostgreSQL database
     */
    private function searchDatabase($query, $type, $limit, $offset) {
        $sql = "
            SELECT 
                id, title, url, description, content, 
                ts_rank(to_tsvector('simple', content || ' ' || title), plainto_tsquery('simple', :query)) as score,
                pagerank,
                content_type,
                thumbnail,
                duration,
                published_at
            FROM search_documents
            WHERE to_tsvector('simple', content || ' ' || title) @@ plainto_tsquery('simple', :query)
            AND (:type = 'all' OR content_type = :type)
            ORDER BY score DESC, pagerank DESC
            LIMIT :limit OFFSET :offset
        ";

        return $this->db->fetchAll($sql, [
            ':query' => $query,
            ':type' => $type,
            ':limit' => $limit,
            ':offset' => $offset
        ]);
    }

    /**
     * Search in OpenSearch
     */
    private function searchOpenSearch($query, $type, $limit, $offset) {
        $index = $type === 'all' ? 'bsearch_*' : "bsearch_{$type}";
        
        $body = [
            'from' => $offset,
            'size' => $limit,
            'query' => [
                'multi_match' => [
                    'query' => $query,
                    'fields' => ['title^2', 'content', 'description'],
                    'type' => 'best_fields'
                ]
            ],
            'sort' => [
                ['_score' => 'desc'],
                ['pagerank' => 'desc']
            ]
        ];

        $ch = curl_init("http://{$this->opensearchHost}:{$this->opensearchPort}/{$index}/_search");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        $results = [];

        if (isset($data['hits']['hits'])) {
            foreach ($data['hits']['hits'] as $hit) {
                $results[] = array_merge($hit['_source'], ['score' => $hit['_score']]);
            }
        }

        return $results;
    }

    /**
     * Apply ranking adjustments
     */
    private function applyRanking($results, $query) {
        foreach ($results as &$result) {
            $score = (float)$result['score'];
            $pagerank = (float)($result['pagerank'] ?? 0);
            
            // Combine BM25 score with PageRank
            $finalScore = ($score * 0.7) + ($pagerank * 0.3);
            
            // Boost fresh content for news
            if (isset($result['published_at'])) {
                $daysOld = (time() - strtotime($result['published_at'])) / 86400;
                if ($daysOld < 7) {
                    $finalScore *= 1.2;
                }
            }
            
            $result['final_score'] = $finalScore;
        }

        usort($results, function($a, $b) {
            return $b['final_score'] <=> $a['final_score'];
        });

        return $results;
    }

    /**
     * Normalize text for Persian/English/Arabic
     */
    private function normalizeText($text) {
        // Convert Arabic characters to Persian
        $text = str_replace(['ك', 'ي', 'ى'], ['ک', 'ی', 'ی'], $text);
        
        // Remove diacritics
        $text = preg_replace('/[\x{064B}-\x{065F}]/u', '', $text);
        
        // Normalize spaces
        $text = preg_replace('/\s+/', ' ', trim($text));
        
        // Convert to lowercase for English
        $text = strtolower($text);
        
        return $text;
    }

    /**
     * Get search suggestions
     */
    private function getSuggestions($query) {
        $sql = "SELECT DISTINCT suggestion FROM search_suggestions 
                WHERE suggestion LIKE :query || '%' 
                ORDER BY popularity DESC 
                LIMIT 5";
        
        $results = $this->db->fetchAll($sql, [':query' => $this->normalizeText($query)]);
        return array_column($results, 'suggestion');
    }

    /**
     * Get related searches
     */
    private function getRelatedSearches($query) {
        $sql = "SELECT related_query FROM search_related 
                WHERE original_query = :query 
                ORDER BY count DESC 
                LIMIT 5";
        
        $results = $this->db->fetchAll($sql, [':query' => $this->normalizeText($query)]);
        return array_column($results, 'related_query');
    }

    /**
     * Get top context for AI
     */
    public function getTopContext($query, $limit = 5) {
        $results = $this->search($query, 'web', 1);
        $context = [];

        foreach (array_slice($results['results'], 0, $limit) as $result) {
            $context[] = [
                'title' => $result['title'],
                'url' => $result['url'],
                'content' => substr($result['content'], 0, 500)
            ];
        }

        return $context;
    }

    /**
     * SEO Analysis for a URL
     */
    public function analyzeSEO($url) {
        $html = @file_get_contents($url);
        if (!$html) {
            return ['error' => 'Could not fetch URL'];
        }

        $dom = new DOMDocument();
        @$dom->loadHTML($html);
        $xpath = new DOMXPath($dom);

        $analysis = [
            'url' => $url,
            'score' => 0,
            'issues' => [],
            'suggestions' => []
        ];

        // Check Title
        $titleNodes = $xpath->query('//title');
        $title = $titleNodes->length > 0 ? $titleNodes->item(0)->textContent : '';
        if (empty($title)) {
            $analysis['issues'][] = 'Missing title tag';
        } elseif (strlen($title) < 30 || strlen($title) > 60) {
            $analysis['issues'][] = 'Title length should be between 30-60 characters';
        } else {
            $analysis['score'] += 10;
        }

        // Check Meta Description
        $metaDesc = $xpath->query('//meta[@name="description"]/@content');
        $description = $metaDesc->length > 0 ? $metaDesc->item(0)->nodeValue : '';
        if (empty($description)) {
            $analysis['issues'][] = 'Missing meta description';
        } else {
            $analysis['score'] += 10;
        }

        // Check Headings
        $h1Nodes = $xpath->query('//h1');
        if ($h1Nodes->length === 0) {
            $analysis['issues'][] = 'Missing H1 tag';
        } elseif ($h1Nodes->length > 1) {
            $analysis['suggestions'][] = 'Consider using only one H1 tag';
        } else {
            $analysis['score'] += 10;
        }

        // Check Images Alt
        $images = $xpath->query('//img');
        $imagesWithoutAlt = 0;
        foreach ($images as $img) {
            if (!$img->getAttribute('alt')) {
                $imagesWithoutAlt++;
            }
        }
        if ($imagesWithoutAlt > 0) {
            $analysis['issues'][] = "{$imagesWithoutAlt} images missing alt attribute";
        } else {
            $analysis['score'] += 10;
        }

        // Check Mobile Friendly (viewport)
        $viewport = $xpath->query('//meta[@name="viewport"]/@content');
        if ($viewport->length === 0) {
            $analysis['issues'][] = 'Missing viewport meta tag (not mobile-friendly)';
        } else {
            $analysis['score'] += 10;
        }

        // Generate fixes
        $analysis['generated_fixes'] = [
            'title' => empty($title) ? 'New Page Title - Brand Name' : null,
            'meta_description' => empty($description) ? 'A concise description of your page content (150-160 characters)' : null,
            'schema_markup' => $this->generateSchemaMarkup($url, $title, $description)
        ];

        $analysis['score'] = min(100, $analysis['score'] * 5);

        return $analysis;
    }

    /**
     * Generate Schema Markup
     */
    private function generateSchemaMarkup($url, $title, $description) {
        $schema = [
            "@context" => "https://schema.org",
            "@type" => "WebPage",
            "url" => $url,
            "name" => $title ?: "Page Title",
            "description" => $description ?: "Page description"
        ];
        return json_encode($schema, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }
}
