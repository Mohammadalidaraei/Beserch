<?php
/**
 * Web Crawler Class
 * Crawls websites respecting robots.txt
 */

class Crawler {
    private $db;
    private $userAgent = 'BSearchBot/1.0 (+https://bsearch.ir/bot)';
    private $maxDepth = 5;
    private $delay = 1; // seconds between requests

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Add a crawl job
     */
    public function addJob($url, $sitemap = '') {
        $jobId = $this->db->insert('crawl_jobs', [
            'url' => $url,
            'sitemap_url' => $sitemap,
            'status' => 'pending',
            'created_at' => date('Y-m-d H:i:s')
        ]);

        // Process sitemap if provided
        if ($sitemap) {
            $this->processSitemap($sitemap, $jobId);
        } else {
            // Start crawling from the main URL
            $this->crawl($url, $jobId, 0);
        }

        return $jobId;
    }

    /**
     * Process sitemap XML
     */
    private function processSitemap($sitemapUrl, $jobId) {
        $xml = @file_get_contents($sitemapUrl);
        if (!$xml) return;

        $simpleXml = @simplexml_load_string($xml);
        if (!$simpleXml) return;

        $urls = [];
        
        // Handle sitemap index
        if (isset($simpleXml->sitemap)) {
            foreach ($simpleXml->sitemap as $sitemap) {
                $loc = (string)$sitemap->loc;
                $this->processSitemap($loc, $jobId);
            }
            return;
        }

        // Handle URL set
        if (isset($simpleXml->url)) {
            foreach ($simpleXml->url as $urlEntry) {
                $loc = (string)$urlEntry->loc;
                $priority = isset($urlEntry->priority) ? (float)$urlEntry->priority : 0.5;
                $lastmod = isset($urlEntry->lastmod) ? (string)$urlEntry->lastmod : null;
                
                $urls[] = [
                    'url' => $loc,
                    'priority' => $priority,
                    'lastmod' => $lastmod,
                    'job_id' => $jobId,
                    'status' => 'pending',
                    'created_at' => date('Y-m-d H:i:s')
                ];
            }
        }

        // Batch insert URLs
        if (!empty($urls)) {
            foreach ($urls as $urlData) {
                $this->db->insert('crawl_queue', $urlData);
            }
        }
    }

    /**
     * Crawl a single URL
     */
    public function crawl($url, $jobId, $depth = 0) {
        if ($depth > $this->maxDepth) return;

        // Check robots.txt
        if (!$this->isAllowed($url)) {
            return;
        }

        // Fetch page
        $html = $this->fetchPage($url);
        if (!$html) return;

        // Parse and store
        $pageData = $this->parsePage($url, $html);
        
        try {
            $this->db->insert('crawl_pages', [
                'job_id' => $jobId,
                'url' => $url,
                'title' => $pageData['title'],
                'content' => $pageData['content'],
                'meta_description' => $pageData['description'],
                'headers' => json_encode($pageData['headers']),
                'links' => json_encode($pageData['links']),
                'images' => json_encode($pageData['images']),
                'status_code' => $pageData['status'],
                'crawled_at' => date('Y-m-d H:i:s')
            ]);

            // Index the page
            $this->indexPage($pageData);
        } catch (Exception $e) {
            // Log error
        }

        // Extract and queue new links
        if ($depth < $this->maxDepth) {
            foreach ($pageData['links'] as $link) {
                $absoluteUrl = $this->makeAbsolute($link, $url);
                if ($this->isValidUrl($absoluteUrl)) {
                    sleep($this->delay);
                    $this->crawl($absoluteUrl, $jobId, $depth + 1);
                }
            }
        }
    }

    /**
     * Fetch page content
     */
    private function fetchPage($url) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_USERAGENT, $this->userAgent);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: text/html,application/xhtml+xml',
            'Accept-Language: fa,en;q=0.9'
        ]);

        $html = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$html) {
            return false;
        }

        return $html;
    }

    /**
     * Parse page content
     */
    private function parsePage($url, $html) {
        $dom = new DOMDocument();
        @$dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
        $xpath = new DOMXPath($dom);

        // Extract title
        $titleNodes = $xpath->query('//title');
        $title = $titleNodes->length > 0 ? trim($titleNodes->item(0)->textContent) : '';

        // Extract meta description
        $metaDesc = $xpath->query('//meta[@name="description"]/@content');
        $description = $metaDesc->length > 0 ? trim($metaDesc->item(0)->nodeValue) : '';

        // Extract main content (simplified)
        $body = $xpath->query('//body')->item(0);
        $content = '';
        if ($body) {
            // Remove scripts and styles
            foreach ($xpath->query('//script|//style', $body) as $node) {
                $node->parentNode->removeChild($node);
            }
            $content = trim($body->textContent);
        }

        // Extract headers
        $headers = [];
        for ($i = 1; $i <= 6; $i++) {
            $hNodes = $xpath->query("//h{$i}");
            foreach ($hNodes as $node) {
                $headers[] = ['level' => $i, 'text' => trim($node->textContent)];
            }
        }

        // Extract links
        $links = [];
        $linkNodes = $xpath->query('//a/@href');
        foreach ($linkNodes as $node) {
            $links[] = trim($node->nodeValue);
        }
        $links = array_unique($links);

        // Extract images
        $images = [];
        $imgNodes = $xpath->query('//img/@src');
        foreach ($imgNodes as $node) {
            $images[] = trim($node->nodeValue);
        }
        $images = array_unique($images);

        return [
            'title' => $title,
            'content' => $content,
            'description' => $description,
            'headers' => $headers,
            'links' => array_slice($links, 0, 100), // Limit links
            'images' => array_slice($images, 0, 50), // Limit images
            'status' => 200
        ];
    }

    /**
     * Index page in search engine
     */
    private function indexPage($pageData) {
        // Determine content type
        $contentType = 'web';
        if (!empty($pageData['images'])) {
            $contentType = 'image';
        }

        // Insert into search_documents
        try {
            $this->db->insert('search_documents', [
                'url' => $pageData['title'] ?: substr($pageData['content'], 0, 50),
                'title' => $pageData['title'] ?: 'Untitled',
                'description' => $pageData['description'],
                'content' => substr($pageData['content'], 0, 65535), // Limit content size
                'content_type' => $contentType,
                'pagerank' => 0.5, // Default PageRank
                'indexed_at' => date('Y-m-d H:i:s')
            ]);
        } catch (Exception $e) {
            // Handle duplicate or error
        }
    }

    /**
     * Check robots.txt
     */
    private function isAllowed($url) {
        $parsed = parse_url($url);
        $robotsUrl = $parsed['scheme'] . '://' . $parsed['host'] . '/robots.txt';
        
        $robots = @file_get_contents($robotsUrl);
        if (!$robots) {
            return true; // No robots.txt, allow all
        }

        $lines = explode("\n", $robots);
        $allowed = true;
        $currentUserAgent = '*';

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;

            if (stripos($line, 'User-agent:') === 0) {
                $agent = trim(substr($line, 11));
                $currentUserAgent = $agent;
            }

            if (stripos($line, 'Disallow:') === 0 && 
                ($currentUserAgent === '*' || stripos($currentUserAgent, 'bsearchbot') !== false)) {
                $disallowedPath = trim(substr($line, 9));
                if (!empty($disallowedPath) && strpos($parsed['path'], $disallowedPath) === 0) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Make absolute URL from relative
     */
    private function makeAbsolute($relative, $base) {
        if (parse_url($relative, PHP_URL_SCHEME) !== null) {
            return $relative;
        }

        $baseParsed = parse_url($base);
        $basePath = dirname($baseParsed['path'] ?? '/');

        if ($relative[0] === '/') {
            return $baseParsed['scheme'] . '://' . $baseParsed['host'] . $relative;
        }

        return $baseParsed['scheme'] . '://' . $baseParsed['host'] . $basePath . '/' . $relative;
    }

    /**
     * Validate URL
     */
    private function isValidUrl($url) {
        $parsed = parse_url($url);
        
        if (!isset($parsed['scheme']) || !isset($parsed['host'])) {
            return false;
        }

        if (!in_array(strtolower($parsed['scheme']), ['http', 'https'])) {
            return false;
        }

        // Only crawl same domain or subdomains (configurable)
        // For now, allow all HTTP(S) URLs
        
        return true;
    }
}
