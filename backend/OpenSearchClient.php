<?php
/**
 * OpenSearch Client
 * کلاینت برای ارتباط با OpenSearch/Elasticsearch
 */

class OpenSearchClient {
    private static $instance = null;
    private $config;
    private $hosts;

    private function __construct() {
        $this->config = require __DIR__ . '/config.php';
        $this->hosts = $this->config['opensearch']['hosts'];
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * ارسال درخواست به OpenSearch
     */
    private function request($method, $path, $data = null) {
        $host = $this->hosts[0];
        $url = "http://{$host}{$path}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return ['error' => $error];
        }
        
        return [
            'status' => $httpCode,
            'body' => json_decode($response, true)
        ];
    }

    /**
     * ایجاد ایندکس
     */
    public function createIndex($indexName, $settings = []) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        $defaultSettings = [
            'settings' => [
                'number_of_shards' => 3,
                'number_of_replicas' => 1,
                'analysis' => [
                    'analyzer' => [
                        'persian_analyzer' => [
                            'type' => 'custom',
                            'tokenizer' => 'standard',
                            'filter' => ['lowercase', 'persian_normalization']
                        ]
                    ]
                ]
            ],
            'mappings' => [
                'properties' => [
                    'title' => [
                        'type' => 'text',
                        'analyzer' => 'persian_analyzer',
                        'boost' => 2.0
                    ],
                    'content' => [
                        'type' => 'text',
                        'analyzer' => 'persian_analyzer'
                    ],
                    'url' => ['type' => 'keyword'],
                    'domain' => ['type' => 'keyword'],
                    'language' => ['type' => 'keyword'],
                    'category' => ['type' => 'keyword'],
                    'page_rank' => ['type' => 'float'],
                    'views_count' => ['type' => 'integer'],
                    'clicks_count' => ['type' => 'integer'],
                    'published_at' => ['type' => 'date'],
                    'crawled_at' => ['type' => 'date'],
                    'tags' => ['type' => 'keyword'],
                    'image_url' => ['type' => 'keyword'],
                    'video_duration' => ['type' => 'integer'],
                    'author' => ['type' => 'text'],
                ]
            ]
        ];
        
        $settings = array_merge_recursive($defaultSettings, $settings);
        
        return $this->request('PUT', "/{$fullIndexName}", $settings);
    }

    /**
     * حذف ایندکس
     */
    public function deleteIndex($indexName) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        return $this->request('DELETE', "/{$fullIndexName}");
    }

    /**
     * اضافه کردن سند
     */
    public function indexDocument($indexName, $id, $document) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        return $this->request('PUT', "/{$fullIndexName}/_doc/{$id}", $document);
    }

    /**
     * حذف سند
     */
    public function deleteDocument($indexName, $id) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        return $this->request('DELETE', "/{$fullIndexName}/_doc/{$id}");
    }

    /**
     * جستجو
     */
    public function search($indexName, $query, $filters = [], $from = 0, $size = 10) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        $searchBody = [
            'from' => $from,
            'size' => $size,
            'query' => [
                'bool' => [
                    'must' => [
                        [
                            'multi_match' => [
                                'query' => $query,
                                'fields' => ['title^2', 'content', 'tags'],
                                'type' => 'best_fields',
                                'fuzziness' => 'AUTO'
                            ]
                        ]
                    ],
                    'filter' => []
                ]
            ],
            'highlight' => [
                'pre_tags' => ['<mark>'],
                'post_tags' => ['</mark>'],
                'fields' => [
                    'title' => ['fragment_size' => 150],
                    'content' => ['fragment_size' => 150]
                ]
            ],
            'sort' => [
                '_score' => ['order' => 'desc'],
                'page_rank' => ['order' => 'desc']
            ]
        ];
        
        // افزودن فیلترها
        if (!empty($filters['language'])) {
            $searchBody['query']['bool']['filter'][] = [
                'term' => ['language' => $filters['language']]
            ];
        }
        
        if (!empty($filters['category'])) {
            $searchBody['query']['bool']['filter'][] = [
                'term' => ['category' => $filters['category']]
            ];
        }
        
        if (!empty($filters['domain'])) {
            $searchBody['query']['bool']['filter'][] = [
                'term' => ['domain' => $filters['domain']]
            ];
        }
        
        return $this->request('POST', "/{$fullIndexName}/_search", $searchBody);
    }

    /**
     * جستجوی معنایی (Semantic Search)
     */
    public function semanticSearch($indexName, $queryVector, $size = 10) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        // جستجوی برداری (نیاز به پلاگین k-NN دارد)
        $searchBody = [
            'size' => $size,
            'query' => [
                'knn' => [
                    'content_vector' => [
                        'vector' => $queryVector,
                        'k' => $size
                    ]
                ]
            ]
        ];
        
        return $this->request('POST', "/{$fullIndexName}/_search", $searchBody);
    }

    /**
     * پیشنهاد کلمات (Autocomplete/Suggestions)
     */
    public function suggest($indexName, $query, $size = 5) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        $searchBody = [
            'suggest' => [
                'query-suggest' => [
                    'prefix' => $query,
                    'completion' => [
                        'field' => 'title_suggest',
                        'size' => $size,
                        'skip_duplicates' => true
                    ]
                ]
            ],
            'size' => 0
        ];
        
        return $this->request('POST', "/{$fullIndexName}/_search", $searchBody);
    }

    /**
     * آمار ایندکس
     */
    public function getIndexStats($indexName) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        return $this->request('GET', "/{$fullIndexName}/_stats");
    }

    /**
     * Bulk Indexing
     */
    public function bulkIndex($indexName, $documents) {
        $prefix = $this->config['opensearch']['index_prefix'];
        $fullIndexName = "{$prefix}{$indexName}";
        
        $body = '';
        foreach ($documents as $doc) {
            $body .= json_encode(['index' => ['_index' => $fullIndexName, '_id' => $doc['id']]]) . "\n";
            $body .= json_encode($doc['data']) . "\n";
        }
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "http://{$this->hosts[0]}/{$fullIndexName}/_bulk");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-ndjson']);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status' => $httpCode,
            'body' => json_decode($response, true)
        ];
    }
}
