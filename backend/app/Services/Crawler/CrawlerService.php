<?php

namespace App\Services\Crawler;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DomCrawler\Crawler as DomCrawler;
use App\Models\CrawlJob;
use App\Models\CrawlPage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class CrawlerService
{
    protected Client $client;
    protected string $userAgent;
    protected int $delayMs;
    protected array $visitedUrls = [];
    protected array $robotsRules = [];

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
            'allow_redirects' => [
                'max' => 5,
                'strict' => true,
            ],
        ]);
        
        $this->userAgent = config('services.crawler.user_agent', 'BSearchBot/1.0');
        $this->delayMs = config('services.crawler.delay_ms', 1000);
    }

    public function crawl(CrawlJob $crawlJob): void
    {
        $crawlJob->markAsRunning();

        try {
            // Fetch robots.txt
            $this->fetchRobotsTxt($crawlJob->domain);

            // Start crawling from the root URL
            $this->crawlUrl($crawlJob, $crawlJob->url, 0);

            $crawlJob->markAsCompleted();
        } catch (\Exception $e) {
            $crawlJob->markAsFailed($e->getMessage());
            Log::error('Crawl job failed', [
                'job_id' => $crawlJob->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function crawlUrl(CrawlJob $crawlJob, string $url, int $currentDepth): void
    {
        // Check depth limit
        if ($currentDepth > $crawlJob->max_depth) {
            return;
        }

        // Check if already visited
        if (in_array($url, $this->visitedUrls)) {
            return;
        }

        // Check robots.txt
        if ($crawlJob->respect_robots_txt && !$this->isAllowed($url)) {
            return;
        }

        // Check page limit
        if ($crawlJob->pages_crawled >= $crawlJob->max_pages_per_site) {
            return;
        }

        $this->visitedUrls[] = $url;

        try {
            $startTime = microtime(true);
            
            $response = $this->client->get($url, [
                'headers' => [
                    'User-Agent' => $this->userAgent,
                    'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language' => 'fa-IR,fa;q=0.9,en;q=0.8',
                ],
            ]);

            $loadTimeMs = (microtime(true) - $startTime) * 1000;
            $statusCode = $response->getStatusCode();
            $contentType = $response->getHeaderLine('Content-Type');
            $htmlContent = (string) $response->getBody();

            // Parse the page
            $domCrawler = new DomCrawler($htmlContent);
            
            $title = $domCrawler->filterXPath('//title')->first()->text() ?? '';
            $metaDescription = $domCrawler->filterXPath('//meta[@name="description"]')->first()->attr('content') ?? '';
            $metaKeywords = $domCrawler->filterXPath('//meta[@name="keywords"]')->first()->attr('content') ?? '';

            // Extract links
            $links = $domCrawler->filter('a')->links();
            $extractedLinks = array_map(fn($link) => $link->getUri(), $links);

            // Extract images
            $images = $domCrawler->filter('img')->each(function ($node) {
                return $node->attr('src');
            });

            // Get text content
            $textContent = strip_tags($htmlContent);
            $wordCount = str_word_count($textContent);

            // Detect language
            $language = $this->detectLanguage($textContent);

            // Save crawl page
            $crawlPage = CrawlPage::create([
                'crawl_job_id' => $crawlJob->id,
                'url' => $url,
                'domain' => $crawlJob->domain,
                'status_code' => $statusCode,
                'content_type' => $contentType,
                'content_length' => strlen($htmlContent),
                'title' => $title,
                'meta_description' => $metaDescription,
                'meta_keywords' => $metaKeywords,
                'headings' => $this->extractHeadings($domCrawler),
                'links' => $extractedLinks,
                'images' => array_filter($images),
                'html_content' => $htmlContent,
                'text_content' => $textContent,
                'language' => $language,
                'word_count' => $wordCount,
                'load_time_ms' => round($loadTimeMs),
                'crawled_at' => now(),
            ]);

            $crawlJob->increment('pages_crawled');

            // Apply delay
            usleep($this->delayMs * 1000);

            // Crawl extracted links if enabled
            if ($crawlJob->follow_links && $currentDepth < $crawlJob->max_depth) {
                foreach ($extractedLinks as $link) {
                    $absoluteUrl = $this->resolveUrl($link, $url);
                    if ($this->isInternalLink($absoluteUrl, $crawlJob->domain)) {
                        $this->crawlUrl($crawlJob, $absoluteUrl, $currentDepth + 1);
                    }
                }
            }

        } catch (RequestException $e) {
            Log::warning('Failed to crawl URL', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            CrawlPage::create([
                'crawl_job_id' => $crawlJob->id,
                'url' => $url,
                'domain' => $crawlJob->domain,
                'status_code' => $e->getResponse()?->getStatusCode() ?? 0,
                'error_message' => $e->getMessage(),
                'crawled_at' => now(),
            ]);

            $crawlJob->increment('pages_failed');
        }
    }

    protected function fetchRobotsTxt(string $domain): void
    {
        try {
            $response = Http::get("https://{$domain}/robots.txt");
            if ($response->successful()) {
                $this->parseRobotsTxt($response->body());
            }
        } catch (\Exception $e) {
            Log::debug('Failed to fetch robots.txt', ['domain' => $domain]);
        }
    }

    protected function parseRobotsTxt(string $content): void
    {
        $lines = explode("\n", $content);
        $currentUserAgent = null;

        foreach ($lines as $line) {
            $line = trim($line);
            
            if (stripos($line, 'User-agent:') === 0) {
                $currentUserAgent = trim(substr($line, 11));
            } elseif (stripos($line, 'Disallow:') === 0 && $currentUserAgent) {
                if ($currentUserAgent === '*' || stripos($currentUserAgent, 'BSearchBot') !== false) {
                    $path = trim(substr($line, 9));
                    $this->robotsRules[] = $path;
                }
            }
        }
    }

    protected function isAllowed(string $url): bool
    {
        $path = parse_url($url, PHP_URL_PATH) ?? '/';
        
        foreach ($this->robotsRules as $rule) {
            if ($rule === '*' || strpos($path, $rule) === 0) {
                return false;
            }
        }

        return true;
    }

    protected function detectLanguage(string $text): string
    {
        // Simple heuristic for Persian detection
        $persianChars = preg_match_all('/[\x{600}-\x{6FF}]/u', $text);
        $totalChars = mb_strlen($text);

        if ($totalChars > 0 && ($persianChars / $totalChars) > 0.3) {
            return 'fa';
        }

        return 'en';
    }

    protected function extractHeadings(DomCrawler $crawler): array
    {
        $headings = [];

        foreach (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as $tag) {
            $headings[$tag] = $crawler->filter($tag)->each(function ($node) {
                return trim($node->text());
            });
        }

        return $headings;
    }

    protected function resolveUrl(string $link, string $baseUrl): string
    {
        if (strpos($link, 'http') === 0) {
            return $link;
        }

        $baseParsed = parse_url($baseUrl);
        $base = $baseParsed['scheme'] . '://' . $baseParsed['host'];

        if (strpos($link, '/') === 0) {
            return $base . $link;
        }

        return $base . '/' . ltrim($link, '/');
    }

    protected function isInternalLink(string $url, string $domain): bool
    {
        $parsedUrl = parse_url($url);
        $urlDomain = $parsedUrl['host'] ?? '';

        return $urlDomain === $domain || ends_with($urlDomain, '.' . $domain);
    }
}
