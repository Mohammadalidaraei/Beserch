<?php
/**
 * AI Service Client
 * کلاینت برای ارتباط با سرویس هوش مصنوعی (Python/FastAPI)
 */

class AiClient {
    private static $instance = null;
    private $config;
    private $baseUrl;
    private $timeout;

    private function __construct() {
        $this->config = require __DIR__ . '/config.php';
        $this->baseUrl = $this->config['ai_service']['url'];
        $this->timeout = $this->config['ai_service']['timeout'];
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * ارسال درخواست به سرویس AI
     */
    private function request($endpoint, $data = [], $method = 'POST') {
        $url = "{$this->baseUrl}{$endpoint}";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
        ]);
        
        if ($data !== null && !empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return ['success' => false, 'error' => $error];
        }
        
        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'status' => $httpCode,
            'data' => json_decode($response, true)
        ];
    }

    /**
     * تولید پاسخ هوشمند برای سوال کاربر
     */
    public function generateAnswer($query, $context = []) {
        return $this->request('/api/v1/generate', [
            'query' => $query,
            'context' => $context,
            'language' => 'fa'
        ]);
    }

    /**
     * تحلیل معنایی متن (Semantic Analysis)
     */
    public function analyzeText($text) {
        return $this->request('/api/v1/analyze', [
            'text' => $text,
            'language' => 'fa'
        ]);
    }

    /**
     * تشخیص نیت کاربر (Intent Detection)
     */
    public function detectIntent($query) {
        return $this->request('/api/v1/intent', [
            'query' => $query,
            'language' => 'fa'
        ]);
    }

    /**
     * تصحیح املایی (Spell Correction)
     */
    public function correctSpelling($text) {
        return $this->request('/api/v1/spellcheck', [
            'text' => $text,
            'language' => 'fa'
        ]);
    }

    /**
     * استخراج کلمات کلیدی (Keyword Extraction)
     */
    public function extractKeywords($text, $limit = 10) {
        return $this->request('/api/v1/keywords', [
            'text' => $text,
            'limit' => $limit,
            'language' => 'fa'
        ]);
    }

    /**
     * تشخیص موجودیت‌ها (Entity Recognition)
     */
    public function recognizeEntities($text) {
        return $this->request('/api/v1/entities', [
            'text' => $text,
            'language' => 'fa'
        ]);
    }

    /**
     * خلاصه‌سازی متن (Text Summarization)
     */
    public function summarizeText($text, $maxLength = 200) {
        return $this->request('/api/v1/summarize', [
            'text' => $text,
            'max_length' => $maxLength,
            'language' => 'fa'
        ]);
    }

    /**
     * تحلیل احساسات (Sentiment Analysis)
     */
    public function analyzeSentiment($text) {
        return $this->request('/api/v1/sentiment', [
            'text' => $text,
            'language' => 'fa'
        ]);
    }

    /**
     * تولید محتوای سئو (SEO Content Generation)
     */
    public function generateSeoContent($url, $content) {
        return $this->request('/api/v1/seo/generate', [
            'url' => $url,
            'content' => $content,
            'language' => 'fa'
        ]);
    }

    /**
     * پیشنهاد عنوان سئو (SEO Title Suggestions)
     */
    public function suggestSeoTitles($content, $keywords = []) {
        return $this->request('/api/v1/seo/titles', [
            'content' => $content,
            'keywords' => $keywords,
            'language' => 'fa'
        ]);
    }

    /**
     * تولید متا دیسکریپشن (Meta Description Generation)
     */
    public function generateMetaDescription($content, $keywords = []) {
        return $this->request('/api/v1/seo/meta-description', [
            'content' => $content,
            'keywords' => $keywords,
            'language' => 'fa'
        ]);
    }

    /**
     * تولید اسکیما (Schema Generation)
     */
    public function generateSchema($type, $data) {
        return $this->request('/api/v1/seo/schema', [
            'type' => $type, // Article, FAQ, Product, etc.
            'data' => $data,
            'language' => 'fa'
        ]);
    }

    /**
     * تبدیل صوت به متن (Speech to Text)
     */
    public function speechToText($audioBase64) {
        return $this->request('/api/v1/speech-to-text', [
            'audio' => $audioBase64,
            'language' => 'fa'
        ]);
    }

    /**
     * ترجمه متن (Translation)
     */
    public function translateText($text, $from, $to) {
        return $this->request('/api/v1/translate', [
            'text' => $text,
            'from' => $from,
            'to' => $to
        ]);
    }

    /**
     * شباهت متنی (Text Similarity)
     */
    public function textSimilarity($text1, $text2) {
        return $this->request('/api/v1/similarity', [
            'text1' => $text1,
            'text2' => $text2,
            'language' => 'fa'
        ]);
    }

    /**
     * دسته‌بندی متن (Text Classification)
     */
    public function classifyText($text, $categories = []) {
        return $this->request('/api/v1/classify', [
            'text' => $text,
            'categories' => $categories,
            'language' => 'fa'
        ]);
    }

    /**
     * پرسش و پاسخ از متن (Question Answering)
     */
    public function questionAnswering($context, $question) {
        return $this->request('/api/v1/qa', [
            'context' => $context,
            'question' => $question,
            'language' => 'fa'
        ]);
    }

    /**
     * بررسی سلامت سرویس AI
     */
    public function healthCheck() {
        return $this->request('/health', [], 'GET');
    }
}
