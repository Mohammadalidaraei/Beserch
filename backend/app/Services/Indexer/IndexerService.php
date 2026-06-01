<?php

namespace App\Services\Indexer;

use App\Models\CrawlPage;
use App\Models\SearchDocument;
use App\Services\Search\SearchService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class IndexerService
{
    protected SearchService $searchService;
    protected int $batchSize = 100;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    public function indexPage(CrawlPage $page): bool
    {
        if ($page->no_index) {
            return false;
        }

        $document = $this->prepareDocument($page);
        
        if (empty($document['title']) && empty($document['content'])) {
            Log::warning("Skipping indexing for page {$page->id}: no title or content");
            return false;
        }

        $success = $this->searchService->indexDocument($document, 'web');
        
        if ($success) {
            $page->update(['is_indexed' => true]);
            
            // Create local database record
            SearchDocument::updateOrCreate(
                ['crawl_page_id' => $page->id],
                [
                    'website_id' => $page->website_id,
                    'title' => $document['title'],
                    'content' => $document['content'],
                    'url' => $document['url'],
                    'language' => $document['language'],
                    'keywords' => $document['keywords'] ?? null,
                    'word_count' => $document['word_count'],
                    'is_active' => true,
                ]
            );
        }

        return $success;
    }

    public function indexBatch(array $pages): int
    {
        $documents = [];
        $indexedCount = 0;

        foreach ($pages as $page) {
            if (!$page instanceof CrawlPage) {
                $page = CrawlPage::find($page);
            }

            if (!$page || $page->no_index) {
                continue;
            }

            $document = $this->prepareDocument($page);
            
            if (!empty($document['title']) || !empty($document['content'])) {
                $documents[] = $document;
                $indexedCount++;
            }
        }

        if (empty($documents)) {
            return 0;
        }

        $success = $this->searchService->bulkIndex($documents, 'web');

        if ($success) {
            CrawlPage::whereIn('id', array_column($pages, 'id'))
                ->update(['is_indexed' => true]);
        }

        return $indexedCount;
    }

    public function removePage(CrawlPage $page): bool
    {
        $success = $this->searchService->deleteDocument((string) $page->id, 'web');
        
        if ($success) {
            $page->update(['is_indexed' => false]);
            
            SearchDocument::where('crawl_page_id', $page->id)
                ->update(['is_active' => false]);
        }

        return $success;
    }

    public function updatePageIndex(CrawlPage $page): bool
    {
        $this->removePage($page);
        return $this->indexPage($page);
    }

    public function reindexWebsite(int $websiteId): int
    {
        $pages = CrawlPage::where('website_id', $websiteId)
            ->where('is_indexed', true)
            ->get();

        $count = 0;
        $batches = $pages->chunk($this->batchSize);

        foreach ($batches as $batch) {
            $count += $this->indexBatch($batch->toArray());
        }

        return $count;
    }

    public function calculatePageRank(): void
    {
        Log::info('Starting PageRank calculation...');
        
        // Get all indexed pages with their links
        $pages = CrawlPage::where('is_indexed', true)
            ->where('no_follow', false)
            ->get(['id', 'website_id', 'links']);

        // Build graph
        $graph = [];
        $pageIds = $pages->pluck('id')->toArray();
        
        foreach ($pages as $page) {
            $graph[$page->id] = [
                'out_links' => [],
                'in_links' => [],
                'pagerank' => 1.0 / count($pageIds)
            ];
        }

        // Populate out-links
        foreach ($pages as $page) {
            $links = $page->links ?? [];
            $internalLinks = array_filter($links, fn($link) => 
                Str::contains($link, $page->website->url)
            );

            foreach ($internalLinks as $link) {
                $linkedPage = CrawlPage::where('url', $link)->first();
                if ($linkedPage && isset($graph[$linkedPage->id])) {
                    $graph[$page->id]['out_links'][] = $linkedPage->id;
                    $graph[$linkedPage->id]['in_links'][] = $page->id;
                }
            }
        }

        // PageRank algorithm
        $dampingFactor = 0.85;
        $iterations = 20;

        for ($i = 0; $i < $iterations; $i++) {
            foreach ($pageIds as $pageId) {
                $rank = (1 - $dampingFactor) / count($pageIds);
                
                foreach ($graph[$pageId]['in_links'] as $inLinkId) {
                    $outLinkCount = count($graph[$inLinkId]['out_links']);
                    if ($outLinkCount > 0) {
                        $rank += ($dampingFactor * $graph[$inLinkId]['pagerank']) / $outLinkCount;
                    }
                }
                
                $graph[$pageId]['pagerank'] = $rank;
            }
        }

        // Update scores in database
        foreach ($graph as $pageId => $data) {
            SearchDocument::where('crawl_page_id', $pageId)
                ->update([
                    'pagerank' => $data['pagerank'],
                    'score' => $this->calculateCombinedScore($data['pagerank'], $pageId)
                ]);
        }

        Log::info('PageRank calculation completed.');
    }

    public function prepareDocument(CrawlPage $page): array
    {
        $content = strip_tags($page->content ?? '');
        $title = strip_tags($page->title ?? '');
        
        // Extract keywords from content
        $keywords = $this->extractKeywords($content, $page->language);
        
        // Calculate word count
        $wordCount = str_word_count($content);

        // Extract links
        $links = $page->links ?? [];
        $internalLinks = array_filter($links, fn($link) => 
            Str::contains($link, $page->website->url)
        );
        $externalLinks = array_diff($links, $internalLinks);

        return [
            'id' => (string) $page->id,
            'crawl_page_id' => $page->id,
            'website_id' => $page->website_id,
            'website_domain' => parse_url($page->url, PHP_URL_HOST),
            'title' => $title,
            'content' => substr($content, 0, 50000), // Limit content size
            'url' => $page->url,
            'final_url' => $page->final_url ?? $page->url,
            'language' => $page->language ?? 'fa',
            'keywords' => $keywords,
            'meta_description' => $page->meta_description,
            'headings' => $page->headings,
            'word_count' => $wordCount,
            'in_links_count' => count($internalLinks),
            'out_links_count' => count($externalLinks),
            'published_at' => $page->created_at,
            'is_active' => !$page->no_index,
            'schema_data' => $page->schema_data,
        ];
    }

    protected function extractKeywords(string $content, string $language = 'fa'): array
    {
        // Remove stop words
        $stopWords = $this->getStopWords($language);
        
        $words = preg_split('/[\s,\.\!\?\;\:\(\)\[\]]+/', mb_strtolower($content), -1, PREG_SPLIT_NO_EMPTY);
        
        $wordFrequency = [];
        foreach ($words as $word) {
            $word = trim($word, " \t\n\r\0\x0B\"'");
            if (mb_strlen($word) > 2 && !in_array($word, $stopWords)) {
                $wordFrequency[$word] = ($wordFrequency[$word] ?? 0) + 1;
            }
        }

        // Sort by frequency and get top keywords
        arsort($wordFrequency);
        
        return array_slice(array_keys($wordFrequency), 0, 20);
    }

    protected function getStopWords(string $language): array
    {
        $persianStopWords = [
            'و', 'یا', 'اما', 'ولی', 'نه', 'بله', 'اگر', 'که', 'چه', 'کدام',
            'این', 'آن', 'یکی', 'هم', 'همه', 'هیچ', 'هر', 'بود', 'باشد',
            'هست', 'نیست', 'نمی', 'را', 'در', 'به', 'از', 'با', 'بر', 'برای',
            'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an',
            'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before',
            'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot',
            'could', 'did', 'do', 'does', 'doing', 'don', 'down', 'during',
            'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
            'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself',
            'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
            'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
            'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our',
            'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
            'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
            'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
            'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
            'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
            'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your',
            'yours', 'yourself', 'yourselves'
        ];

        return $language === 'fa' ? 
            array_merge($persianStopWords, array_slice($persianStopWords, 37)) :
            array_slice($persianStopWords, 37);
    }

    protected function calculateCombinedScore(float $pagerank, int $pageId): float
    {
        // Combine PageRank with other factors
        $document = SearchDocument::find($pageId);
        
        if (!$document) {
            return $pagerank;
        }

        $wordCountScore = min($document->word_count / 500, 1.0);
        $freshnessScore = $this->calculateFreshnessScore($document->published_at);
        
        return ($pagerank * 0.6) + ($wordCountScore * 0.2) + ($freshnessScore * 0.2);
    }

    protected function calculateFreshnessScore(?\DateTime $publishedAt): float
    {
        if (!$publishedAt) {
            return 0.5;
        }

        $daysOld = now()->diffInDays($publishedAt);
        
        if ($daysOld <= 7) {
            return 1.0;
        } elseif ($daysOld <= 30) {
            return 0.8;
        } elseif ($daysOld <= 90) {
            return 0.6;
        } elseif ($daysOld <= 365) {
            return 0.4;
        }
        
        return 0.2;
    }

    public function optimizeIndexes(): void
    {
        Log::info('Optimizing search indexes...');
        
        // Force merge OpenSearch segments
        try {
            $this->searchService->client->indices()->forcemerge([
                'index' => $this->searchService->getIndexName('web'),
                'max_num_segments' => 1
            ]);
        } catch (\Exception $e) {
            Log::error('Force merge error: ' . $e->getMessage());
        }

        // Clear old search queries
        \DB::table('search_queries')
            ->where('created_at', '<', now()->subMonths(3))
            ->delete();

        Log::info('Index optimization completed.');
    }
}
