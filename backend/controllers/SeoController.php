<?php
/**
 * SEO Controller
 * کنترلر تحلیل و تولید سئو
 */

require_once __DIR__ . '/../Database.php';
require_once __DIR__ . '/../AiClient.php';
require_once __DIR__ . '/../Security.php';

class SeoController {
    private $db;
    private $aiClient;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->aiClient = AiClient::getInstance();
    }

    /**
     * تحلیل سئو یک صفحه
     * POST /api/seo/analyze
     */
    public function analyze() {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = $input['url'] ?? '';

        if (empty($url)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'URL الزامی است'
            ]);
            return;
        }

        // دریافت محتوای صفحه
        $content = $this->fetchPageContent($url);
        
        if (!$content) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Fetch Error',
                'message' => 'عدم توانایی در دریافت صفحه'
            ]);
            return;
        }

        // تحلیل محتوا
        $analysis = $this->performSeoAnalysis($url, $content);

        // ذخیره تحلیل
        $analysisId = $this->db->insert('seo_analyses', [
            'url' => $url,
            'score' => $analysis['score'],
            'issues' => json_encode($analysis['issues']),
            'suggestions' => json_encode($analysis['suggestions']),
            'generated_fixes' => json_encode($analysis['fixes'])
        ]);

        echo json_encode([
            'success' => true,
            'data' => [
                'id' => $analysisId,
                'url' => $url,
                'score' => $analysis['score'],
                'grade' => $this->getGrade($analysis['score']),
                'issues' => $analysis['issues'],
                'suggestions' => $analysis['suggestions'],
                'fixes' => $analysis['fixes'],
                'details' => $analysis['details']
            ]
        ]);
    }

    /**
     * تولید محتوای سئو
     * POST /api/seo/generate
     */
    public function generate() {
        $input = json_decode(file_get_contents('php://input'), true);
        $url = $input['url'] ?? '';
        $content = $input['content'] ?? '';

        if (empty($url) && empty($content)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'URL یا محتوا الزامی است'
            ]);
            return;
        }

        // اگر فقط URL داده شده، محتوا را بگیر
        if (empty($content) && !empty($url)) {
            $content = $this->fetchPageContent($url);
        }

        // تولید با AI
        $aiResult = $this->aiClient->generateSeoContent($url, $content);

        if (!$aiResult['success']) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'AI Error',
                'message' => 'خطا در تولید محتوا'
            ]);
            return;
        }

        $generated = $aiResult['data'];

        echo json_encode([
            'success' => true,
            'data' => [
                'title' => $generated['title'] ?? '',
                'metaDescription' => $generated['meta_description'] ?? '',
                'keywords' => $generated['keywords'] ?? [],
                'faqSchema' => $generated['faq_schema'] ?? null,
                'articleSchema' => $generated['article_schema'] ?? null,
                'openGraphTags' => $generated['og_tags'] ?? [],
                'twitterTags' => $generated['twitter_tags'] ?? []
            ]
        ]);
    }

    /**
     * پیشنهاد عنوان سئو
     * POST /api/seo/titles
     */
    public function suggestTitles() {
        $input = json_decode(file_get_contents('php://input'), true);
        $content = $input['content'] ?? '';
        $keywords = $input['keywords'] ?? [];

        if (empty($content)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'محتوا الزامی است'
            ]);
            return;
        }

        $result = $this->aiClient->suggestSeoTitles($content, $keywords);

        if (!$result['success']) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'AI Error',
                'message' => 'خطا در تولید عناوین'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'titles' => $result['data']['titles'] ?? []
            ]
        ]);
    }

    /**
     * تولید متا دیسکریپشن
     * POST /api/seo/meta-description
     */
    public function generateMetaDescription() {
        $input = json_decode(file_get_contents('php://input'), true);
        $content = $input['content'] ?? '';
        $keywords = $input['keywords'] ?? [];

        if (empty($content)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'محتوا الزامی است'
            ]);
            return;
        }

        $result = $this->aiClient->generateMetaDescription($content, $keywords);

        if (!$result['success']) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'AI Error',
                'message' => 'خطا در تولید متا'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'metaDescription' => $result['data']['meta_description'] ?? ''
            ]
        ]);
    }

    /**
     * تولید اسکیما
     * POST /api/seo/schema
     */
    public function generateSchema() {
        $input = json_decode(file_get_contents('php://input'), true);
        $type = $input['type'] ?? 'Article';
        $data = $input['data'] ?? [];

        if (empty($data)) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'Bad Request',
                'message' => 'داده‌ها الزامی هستند'
            ]);
            return;
        }

        $result = $this->aiClient->generateSchema($type, $data);

        if (!$result['success']) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'AI Error',
                'message' => 'خطا در تولید اسکیما'
            ]);
            return;
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'schema' => $result['data']['schema'] ?? [],
                'jsonLd' => $result['data']['json_ld'] ?? ''
            ]
        ]);
    }

    /**
     * دریافت محتوای صفحه
     */
    private function fetchPageContent($url) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USER_AGENT, 'BSearchBot/1.0 (+https://bsearch.ir/bot)');
        
        $html = curl_exec($ch);
        curl_close($ch);

        return $html;
    }

    /**
     * انجام تحلیل سئو
     */
    private function performSeoAnalysis($url, $html) {
        $issues = [];
        $suggestions = [];
        $score = 100;
        $details = [];

        // استخراج تگ‌ها
        $title = $this->extractTag($html, 'title');
        $metaDesc = $this->extractMeta($html, 'description');
        $metaKeywords = $this->extractMeta($html, 'keywords');
        $h1s = $this->extractTags($html, 'h1');
        $h2s = $this->extractTags($html, 'h2');
        $images = $this->extractImages($html);
        $links = $this->extractLinks($html);
        $canonical = $this->extractCanonical($html);
        $robots = $this->extractRobots($html);

        // بررسی Title
        if (empty($title)) {
            $issues[] = ['type' => 'error', 'field' => 'title', 'message' => 'عنوان صفحه وجود ندارد'];
            $score -= 15;
        } elseif (strlen($title) < 30 || strlen($title) > 60) {
            $issues[] = ['type' => 'warning', 'field' => 'title', 'message' => 'طول عنوان باید بین ۳۰ تا ۶۰ کاراکتر باشد'];
            $score -= 5;
        }
        $details['title'] = $title;
        $details['titleLength'] = strlen($title);

        // بررسی Meta Description
        if (empty($metaDesc)) {
            $issues[] = ['type' => 'error', 'field' => 'meta_description', 'message' => 'توضیحات متا وجود ندارد'];
            $score -= 15;
        } elseif (strlen($metaDesc) < 120 || strlen($metaDesc) > 160) {
            $issues[] = ['type' => 'warning', 'field' => 'meta_description', 'message' => 'طول متا دیسکریپشن باید بین ۱۲۰ تا ۱۶۰ کاراکتر باشد'];
            $score -= 5;
        }
        $details['metaDescription'] = $metaDesc;
        $details['metaDescriptionLength'] = strlen($metaDesc);

        // بررسی H1
        if (empty($h1s)) {
            $issues[] = ['type' => 'error', 'field' => 'h1', 'message' => 'تگ H1 وجود ندارد'];
            $score -= 10;
        } elseif (count($h1s) > 1) {
            $issues[] = ['type' => 'warning', 'field' => 'h1', 'message' => 'باید فقط یک تگ H1 داشته باشید'];
            $score -= 5;
        }
        $details['h1Count'] = count($h1s);
        $details['h2Count'] = count($h2s);

        // بررسی تصاویر
        $imagesWithoutAlt = array_filter($images, fn($img) => empty($img['alt']));
        if (!empty($imagesWithoutAlt)) {
            $issues[] = ['type' => 'warning', 'field' => 'images', 'message' => count($imagesWithoutAlt) . ' تصویر بدون متن جایگزین (alt)'];
            $score -= 5;
        }
        $details['totalImages'] = count($images);
        $details['imagesWithAlt'] = count($images) - count($imagesWithoutAlt);

        // بررسی لینک‌ها
        $internalLinks = array_filter($links, fn($link) => strpos($link['href'], parse_url($url, PHP_URL_HOST)) !== false);
        $externalLinks = array_diff($links, $internalLinks);
        $details['internalLinks'] = count($internalLinks);
        $details['externalLinks'] = count($externalLinks);

        if (count($internalLinks) < 3) {
            $suggestions[] = 'لینک‌های داخلی بیشتری اضافه کنید';
        }

        // بررسی Canonical
        if (empty($canonical)) {
            $suggestions[] = 'تگ canonical اضافه کنید';
        }
        $details['canonical'] = $canonical;

        // محاسبه نمره نهایی
        $score = max(0, min(100, $score));

        // تولید پیشنهادات اصلاح
        $fixes = [];
        if (empty($title)) {
            $fixes[] = 'یک عنوان منحصر به فرد و جذاب بین ۳۰ تا ۶۰ کاراکتر بنویسید';
        }
        if (empty($metaDesc)) {
            $fixes[] = 'یک متا دیسکریپشن جذاب بین ۱۲۰ تا ۱۶۰ کاراکتر بنویسید';
        }
        if (empty($h1s)) {
            $fixes[] = 'یک تگ H1 اصلی برای صفحه اضافه کنید';
        }
        if (!empty($imagesWithoutAlt)) {
            $fixes[] = 'برای تمام تصاویر متن جایگزین (alt) توصیفی اضافه کنید';
        }

        return [
            'score' => $score,
            'issues' => $issues,
            'suggestions' => $suggestions,
            'fixes' => $fixes,
            'details' => $details
        ];
    }

    private function extractTag($html, $tag) {
        preg_match("/<{$tag}[^>]*>(.*?)<\/{$tag}>/i", $html, $matches);
        return trim(strip_tags($matches[1] ?? ''));
    }

    private function extractTags($html, $tag) {
        preg_match_all("/<{$tag}[^>]*>(.*?)<\/{$tag}>/i", $html, $matches);
        return array_map(fn($m) => trim(strip_tags($m)), $matches[1] ?? []);
    }

    private function extractMeta($html, $name) {
        preg_match("/<meta[^>]+name=[\"']{$name}[\"'][^>]+content=[\"']([^\"']+)[\"']/i", $html, $matches);
        return trim($matches[1] ?? '');
    }

    private function extractImages($html) {
        preg_match_all('/<img[^>]+src=["\']([^"\']+)["\'][^>]*(?:alt=["\']([^"\']*)["\'])?/i', $html, $matches, PREG_SET_ARRAY);
        return array_map(fn($m) => ['src' => $m[1], 'alt' => $m[2] ?? ''], $matches);
    }

    private function extractLinks($html) {
        preg_match_all('/<a[^>]+href=["\']([^"\']+)["\']/i', $html, $matches);
        return array_map(fn($href) => ['href' => $href], $matches[1] ?? []);
    }

    private function extractCanonical($html) {
        preg_match('/<link[^>]+rel=["\']canonical["\'][^>]+href=["\']([^"\']+)["\']/i', $html, $matches);
        return trim($matches[1] ?? '');
    }

    private function extractRobots($html) {
        preg_match('/<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']/i', $html, $matches);
        return trim($matches[1] ?? '');
    }

    private function getGrade($score) {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }
}
