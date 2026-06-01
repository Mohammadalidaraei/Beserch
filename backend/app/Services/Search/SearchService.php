<?php

namespace App\Services\Search;

use OpenSearch\ClientBuilder;
use Illuminate\Support\Facades\Log;

class SearchService
{
    protected $client;
    protected $indexPrefix = 'bsearch_';

    public function __construct()
    {
        $this->client = ClientBuilder::create()
            ->setHosts([config('services.opensearch.host', 'localhost:9200')])
            ->setBasicAuthentication(
                config('services.opensearch.username', 'admin'),
                config('services.opensearch.password', 'admin')
            )
            ->setSSLVerification(false)
            ->build();
    }

    public function search(string $query, array $options = []): array
    {
        $index = $this->getIndexName($options['type'] ?? 'web');
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 10, 50);
        $language = $options['language'] ?? 'fa';
        $filters = $options['filters'] ?? [];

        $searchParams = [
            'index' => $index,
            'from' => ($page - 1) * $perPage,
            'size' => $perPage,
            'body' => [
                'query' => $this->buildQuery($query, $language, $filters),
                'highlight' => [
                    'pre_tags' => ['<mark class="bg-yellow-200 dark:bg-yellow-800">'],
                    'post_tags' => ['</mark>'],
                    'fields' => [
                        'title' => ['fragment_size' => 150, 'number_of_fragments' => 3],
                        'content' => ['fragment_size' => 150, 'number_of_fragments' => 3],
                    ]
                ],
                '_source' => [
                    'includes' => ['title', 'url', 'content', 'language', 'score', 'published_at', 'website_id']
                ]
            ]
        ];

        if (!empty($options['sort'])) {
            $searchParams['body']['sort'] = $this->buildSort($options['sort']);
        }

        try {
            $response = $this->client->search($searchParams);
            
            return [
                'results' => $this->formatResults($response['hits']['hits']),
                'total' => $response['hits']['total']['value'] ?? 0,
                'took' => $response['took'] ?? 0,
                'aggregations' => $response['aggregations'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('Search error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function semanticSearch(string $query, array $options = []): array
    {
        // First get AI embeddings for the query
        $embedding = $this->getQueryEmbedding($query);
        
        $index = $this->getIndexName($options['type'] ?? 'web');
        
        $searchParams = [
            'index' => $index,
            'size' => $options['per_page'] ?? 10,
            'body' => [
                'query' => [
                    'script_score' => [
                        'query' => ['match_all' => new \stdClass()],
                        'script' => [
                            'source' => "cosineSimilarity(params.queryVector, 'embedding') + 1.0",
                            'params' => ['queryVector' => $embedding]
                        ]
                    ]
                ]
            ]
        ];

        try {
            $response = $this->client->search($searchParams);
            
            return [
                'results' => $this->formatResults($response['hits']['hits']),
                'total' => $response['hits']['total']['value'] ?? 0,
                'semantic' => true,
            ];
        } catch (\Exception $e) {
            Log::error('Semantic search error: ' . $e->getMessage());
            // Fallback to regular search
            return $this->search($query, $options);
        }
    }

    public function imageSearch(string $query, array $options = []): array
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 100);

        $searchParams = [
            'index' => $this->getIndexName('images'),
            'from' => ($page - 1) * $perPage,
            'size' => $perPage,
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [
                            [
                                'multi_match' => [
                                    'query' => $query,
                                    'fields' => ['alt_text^2', 'title^2', 'description', 'page_title']
                                ]
                            ],
                            ['term' => ['is_indexed' => true]]
                        ]
                    ]
                ],
                '_source' => ['includes' => ['url', 'alt_text', 'title', 'width', 'height', 'thumbnails', 'page_url']]
            ]
        ];

        try {
            $response = $this->client->search($searchParams);
            
            return [
                'results' => $this->formatImageResults($response['hits']['hits']),
                'total' => $response['hits']['total']['value'] ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('Image search error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function videoSearch(string $query, array $options = []): array
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 20, 50);

        $searchParams = [
            'index' => $this->getIndexName('videos'),
            'from' => ($page - 1) * $perPage,
            'size' => $perPage,
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [
                            [
                                'multi_match' => [
                                    'query' => $query,
                                    'fields' => ['title^2', 'description', 'channel', 'tags']
                                ]
                            ],
                            ['term' => ['is_indexed' => true]]
                        ]
                    ]
                ],
                'sort' => $this->buildSort($options['sort'] ?? 'relevance'),
                '_source' => ['includes' => ['title', 'description', 'thumbnail_url', 'duration', 'source', 'channel', 'view_count', 'published_at']]
            ]
        ];

        try {
            $response = $this->client->search($searchParams);
            
            return [
                'results' => $this->formatVideoResults($response['hits']['hits']),
                'total' => $response['hits']['total']['value'] ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('Video search error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function newsSearch(string $query, array $options = []): array
    {
        $page = $options['page'] ?? 1;
        $perPage = min($options['per_page'] ?? 10, 50);
        $dateRange = $options['date_range'] ?? null;

        $searchParams = [
            'index' => $this->getIndexName('news'),
            'from' => ($page - 1) * $perPage,
            'size' => $perPage,
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [
                            [
                                'multi_match' => [
                                    'query' => $query,
                                    'fields' => ['title^3', 'content', 'description']
                                ]
                            ],
                            ['term' => ['is_active' => true]]
                        ],
                        'filter' => $dateRange ? [
                            'range' => [
                                'published_at' => $dateRange
                            ]
                        ] : [],
                    ]
                ],
                'sort' => [['published_at' => ['order' => 'desc']]],
                '_source' => ['includes' => ['title', 'url', 'description', 'published_at', 'source', 'image_url']]
            ]
        ];

        try {
            $response = $this->client->search($searchParams);
            
            return [
                'results' => $this->formatNewsResults($response['hits']['hits']),
                'total' => $response['hits']['total']['value'] ?? 0,
            ];
        } catch (\Exception $e) {
            Log::error('News search error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function suggest(string $query, string $language = 'fa'): array
    {
        $searchParams = [
            'index' => $this->getIndexName('suggestions'),
            'body' => [
                'suggest' => [
                    'query-suggest' => [
                        'prefix' => $query,
                        'completion' => [
                            'field' => 'suggestion',
                            'size' => 10,
                            'skip_duplicates' => true
                        ]
                    ]
                ]
            ]
        ];

        try {
            $response = $this->client->search($searchParams);
            $suggestions = [];
            
            foreach ($response['suggest']['query-suggest'][0]['options'] ?? [] as $option) {
                $suggestions[] = $option['text'];
            }
            
            return $suggestions;
        } catch (\Exception $e) {
            Log::error('Suggestion error: ' . $e->getMessage());
            return $this->getFallbackSuggestions($query, $language);
        }
    }

    public function indexDocument(array $document, string $type = 'web'): bool
    {
        $index = $this->getIndexName($type);
        
        $params = [
            'index' => $index,
            'id' => $document['id'] ?? uniqid(),
            'body' => $document
        ];

        try {
            $this->client->index($params);
            return true;
        } catch (\Exception $e) {
            Log::error('Index document error: ' . $e->getMessage());
            return false;
        }
    }

    public function deleteDocument(string $id, string $type = 'web'): bool
    {
        try {
            $this->client->delete([
                'index' => $this->getIndexName($type),
                'id' => $id
            ]);
            return true;
        } catch (\Exception $e) {
            Log::error('Delete document error: ' . $e->getMessage());
            return false;
        }
    }

    public function bulkIndex(array $documents, string $type = 'web'): bool
    {
        $params = ['body' => []];
        
        foreach ($documents as $doc) {
            $params['body'][] = [
                'index' => [
                    '_index' => $this->getIndexName($type),
                    '_id' => $doc['id'] ?? uniqid()
                ]
            ];
            $params['body'][] = $doc;
        }

        try {
            $responses = $this->client->bulk($params);
            return !$responses['errors'];
        } catch (\Exception $e) {
            Log::error('Bulk index error: ' . $e->getMessage());
            return false;
        }
    }

    protected function buildQuery(string $query, string $language, array $filters): array
    {
        // Persian language processing
        $processedQuery = $this->processPersianQuery($query, $language);
        
        $mustClauses = [
            [
                'multi_match' => [
                    'query' => $processedQuery,
                    'fields' => [
                        'title^3',
                        'content^2',
                        'keywords',
                        'meta_description'
                    ],
                    'type' => 'best_fields',
                    'fuzziness' => 'AUTO',
                    'operator' => 'or'
                ]
            ],
            ['term' => ['is_active' => true]]
        ];

        if ($language) {
            $mustClauses[] = ['term' => ['language' => $language]];
        }

        // Apply filters
        if (!empty($filters['site'])) {
            $mustClauses[] = ['term' => ['website_domain' => $filters['site']]];
        }

        if (!empty($filters['date_range'])) {
            $mustClauses[] = ['range' => ['published_at' => $filters['date_range']]];
        }

        return ['bool' => ['must' => $mustClauses]];
    }

    protected function processPersianQuery(string $query, string $language): string
    {
        if ($language !== 'fa') {
            return $query;
        }

        // Normalize Persian characters
        $persianChars = [
            'ك' => 'ک',
            'ي' => 'ی',
            'ۀ' => 'ه',
            'ء' => '',
            'آ' => 'ا',
            'أ' => 'ا',
            'إ' => 'ا'
        ];

        $query = strtr($query, $persianChars);
        
        // Remove extra spaces
        $query = preg_replace('/\s+/', ' ', trim($query));
        
        return $query;
    }

    protected function buildSort(string $sortBy): array
    {
        switch ($sortBy) {
            case 'date':
            case 'newest':
                return [['published_at' => ['order' => 'desc']]];
            case 'oldest':
                return [['published_at' => ['order' => 'asc']]];
            case 'relevance':
            default:
                return [['_score' => ['order' => 'desc']]];
        }
    }

    protected function formatResults(array $hits): array
    {
        $results = [];
        
        foreach ($hits as $hit) {
            $source = $hit['_source'];
            $result = [
                'id' => $hit['_id'],
                'title' => $source['title'] ?? '',
                'url' => $source['url'] ?? '',
                'description' => $source['content'] ?? '',
                'score' => $hit['_score'] ?? 0,
                'highlights' => $hit['highlight'] ?? [],
                'published_at' => $source['published_at'] ?? null,
                'website_id' => $source['website_id'] ?? null,
            ];

            // Use highlighted content if available
            if (!empty($hit['highlight']['content'])) {
                $result['description'] = implode('... ', $hit['highlight']['content']);
            }

            $results[] = $result;
        }

        return $results;
    }

    protected function formatImageResults(array $hits): array
    {
        $results = [];
        
        foreach ($hits as $hit) {
            $source = $hit['_source'];
            $results[] = [
                'id' => $hit['_id'],
                'url' => $source['url'] ?? '',
                'alt_text' => $source['alt_text'] ?? '',
                'title' => $source['title'] ?? '',
                'width' => $source['width'] ?? 0,
                'height' => $source['height'] ?? 0,
                'thumbnail' => $source['thumbnails'][0] ?? $source['url'],
                'page_url' => $source['page_url'] ?? '',
                'score' => $hit['_score'] ?? 0,
            ];
        }

        return $results;
    }

    protected function formatVideoResults(array $hits): array
    {
        $results = [];
        
        foreach ($hits as $hit) {
            $source = $hit['_source'];
            $results[] = [
                'id' => $hit['_id'],
                'title' => $source['title'] ?? '',
                'description' => $source['description'] ?? '',
                'thumbnail' => $source['thumbnail_url'] ?? '',
                'duration' => $source['duration'] ?? 0,
                'source' => $source['source'] ?? '',
                'channel' => $source['channel'] ?? '',
                'view_count' => $source['view_count'] ?? 0,
                'published_at' => $source['published_at'] ?? null,
                'score' => $hit['_score'] ?? 0,
            ];
        }

        return $results;
    }

    protected function formatNewsResults(array $hits): array
    {
        $results = [];
        
        foreach ($hits as $hit) {
            $source = $hit['_source'];
            $results[] = [
                'id' => $hit['_id'],
                'title' => $source['title'] ?? '',
                'url' => $source['url'] ?? '',
                'description' => $source['description'] ?? '',
                'published_at' => $source['published_at'] ?? null,
                'source' => $source['source'] ?? '',
                'image_url' => $source['image_url'] ?? '',
                'score' => $hit['_score'] ?? 0,
            ];
        }

        return $results;
    }

    protected function getQueryEmbedding(string $query): array
    {
        // Call AI service to get embedding
        // This is a placeholder - implement actual embedding generation
        return array_fill(0, 768, 0.0);
    }

    protected function getFallbackSuggestions(string $query, string $language): array
    {
        // Simple fallback suggestions
        return [
            $query,
            $query . ' چیست',
            $query . ' چگونه',
            $query . ' بهترین',
            $query . ' آموزش',
        ];
    }

    protected function getIndexName(string $type): string
    {
        return $this->indexPrefix . $type . '_' . app()->environment();
    }

    public function createIndex(string $type, array $mappings = []): bool
    {
        $index = $this->getIndexName($type);
        
        $defaultMappings = [
            'settings' => [
                'number_of_shards' => 1,
                'number_of_replicas' => 0,
                'analysis' => [
                    'analyzer' => [
                        'persian_analyzer' => [
                            'type' => 'custom',
                            'tokenizer' => 'standard',
                            'filter' => ['lowercase', 'persian_normalize', 'arabic_normalization']
                        ]
                    ]
                ]
            ],
            'mappings' => [
                'properties' => [
                    'title' => ['type' => 'text', 'analyzer' => 'persian_analyzer'],
                    'content' => ['type' => 'text', 'analyzer' => 'persian_analyzer'],
                    'url' => ['type' => 'keyword'],
                    'language' => ['type' => 'keyword'],
                    'is_active' => ['type' => 'boolean'],
                    'published_at' => ['type' => 'date'],
                    'score' => ['type' => 'float'],
                    'embedding' => ['type' => 'dense_vector', 'dims' => 768]
                ]
            ]
        ];

        $params = [
            'index' => $index,
            'body' => array_merge_recursive($defaultMappings, $mappings)
        ];

        try {
            if ($this->client->indices()->exists(['index' => $index])) {
                $this->client->indices()->delete(['index' => $index]);
            }
            $this->client->indices()->create($params);
            return true;
        } catch (\Exception $e) {
            Log::error('Create index error: ' . $e->getMessage());
            return false;
        }
    }
}
