<?php
/**
 * AI Connector Class
 * Connects to Python FastAPI AI Service
 */

class AIConnector {
    private $aiServiceUrl;

    public function __construct() {
        $this->aiServiceUrl = AI_SERVICE_URL;
    }

    /**
     * Generate AI answer for a search query
     */
    public function generateAnswer($query, $context = []) {
        $payload = [
            'query' => $query,
            'context' => $context,
            'language' => $this->detectLanguage($query)
        ];

        $response = $this->callAIService('/api/generate', $payload);
        
        if ($response && isset($response['answer'])) {
            return [
                'answer' => $response['answer'],
                'sources' => $response['sources'] ?? [],
                'confidence' => $response['confidence'] ?? 0.8,
                'model' => $response['model'] ?? 'persian-llm-v1'
            ];
        }

        // Fallback: Generate simple summary from context
        return $this->generateFallbackAnswer($query, $context);
    }

    /**
     * Get semantic similarity for search ranking
     */
    public function getSemanticSimilarity($query, $documents) {
        $payload = [
            'query' => $query,
            'documents' => array_map(function($doc) {
                return $doc['content'] ?? $doc['title'] ?? '';
            }, $documents)
        ];

        $response = $this->callAIService('/api/similarity', $payload);
        
        if ($response && isset($response['scores'])) {
            return $response['scores'];
        }

        // Fallback: return uniform scores
        return array_fill(0, count($documents), 0.5);
    }

    /**
     * Extract entities from text
     */
    public function extractEntities($text) {
        $payload = ['text' => $text];
        $response = $this->callAIService('/api/entities', $payload);
        
        return $response['entities'] ?? [];
    }

    /**
     * Correct spelling for Persian/English queries
     */
    public function correctSpelling($query) {
        $payload = ['text' => $query];
        $response = $this->callAIService('/api/spellcheck', $payload);
        
        return $response['corrected'] ?? $query;
    }

    /**
     * Detect query intent
     */
    public function detectIntent($query) {
        $payload = ['query' => $query];
        $response = $this->callAIService('/api/intent', $payload);
        
        return $response['intent'] ?? 'informational';
    }

    /**
     * Generate SEO content
     */
    public function generateSEOContent($url, $contentType = 'page') {
        $payload = [
            'url' => $url,
            'type' => $contentType
        ];

        $response = $this->callAIService('/api/seo/generate', $payload);
        
        return [
            'title' => $response['title'] ?? '',
            'meta_description' => $response['meta_description'] ?? '',
            'keywords' => $response['keywords'] ?? [],
            'schema_markup' => $response['schema_markup'] ?? ''
        ];
    }

    /**
     * Call AI Service API
     */
    private function callAIService($endpoint, $payload) {
        $url = $this->aiServiceUrl . $endpoint;
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200 || $error) {
            return null;
        }

        return json_decode($response, true);
    }

    /**
     * Detect language of text
     */
    private function detectLanguage($text) {
        // Simple heuristic for Persian/English/Arabic
        $persianPattern = '/[\x{0600}-\x{06FF}]/u';
        $arabicPattern = '/[\x{0600}-\x{06FF}\x{0750}-\x{077F}]/u';
        
        if (preg_match($persianPattern, $text)) {
            return 'fa';
        } elseif (preg_match($arabicPattern, $text)) {
            return 'ar';
        }
        
        return 'en';
    }

    /**
     * Fallback answer generation (when AI service is unavailable)
     */
    private function generateFallbackAnswer($query, $context) {
        if (empty($context)) {
            return [
                'answer' => 'متأسفانه پاسخی برای این سوال یافت نشد.',
                'sources' => [],
                'confidence' => 0.0,
                'model' => 'fallback'
            ];
        }

        // Simple extractive summarization
        $snippets = [];
        foreach ($context as $item) {
            $content = $item['content'] ?? '';
            $sentences = preg_split('/[.!?۔]+/', $content);
            
            // Take first 2 sentences from each source
            for ($i = 0; $i < min(2, count($sentences)); $i++) {
                $sentence = trim($sentences[$i]);
                if (strlen($sentence) > 20 && strlen($sentence) < 200) {
                    $snippets[] = $sentence;
                }
            }
        }

        $answer = implode('. ', array_unique($snippets));
        if (strlen($answer) > 500) {
            $answer = substr($answer, 0, 497) . '...';
        }

        return [
            'answer' => $answer ?: 'پاسخی یافت نشد.',
            'sources' => array_map(function($item) {
                return ['title' => $item['title'], 'url' => $item['url']];
            }, array_slice($context, 0, 3)),
            'confidence' => 0.5,
            'model' => 'extractive-fallback'
        ];
    }
}
