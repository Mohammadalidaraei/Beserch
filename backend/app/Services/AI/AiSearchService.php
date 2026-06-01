<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AiResponse;
use App\Models\SearchQuery;

class AiSearchService
{
    protected string $apiUrl;
    protected string $apiKey;
    protected int $timeout = 30;

    public function __construct()
    {
        $this->apiUrl = config('services.ai_service.url', 'http://localhost:8001');
        $this->apiKey = config('services.ai_service.api_key', '');
    }

    public function generateAnswer(string $query, array $context = [], array $options = []): array
    {
        $startTime = microtime(true);
        
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/generate", [
                    'query' => $query,
                    'context' => $context,
                    'language' => $options['language'] ?? 'fa',
                    'max_tokens' => $options['max_tokens'] ?? 1024,
                    'temperature' => $options['temperature'] ?? 0.7,
                    'stream' => $options['stream'] ?? false,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $generationTime = microtime(true) - $startTime;

                // Save to database
                $aiResponse = AiResponse::create([
                    'query' => $query,
                    'response' => $data['answer'] ?? '',
                    'sources' => $data['sources'] ?? [],
                    'model_used' => $data['model'] ?? 'persian-llm-v1',
                    'confidence_score' => $data['confidence'] ?? 0.0,
                    'tokens_used' => $data['tokens_used'] ?? 0,
                    'generation_time' => $generationTime,
                ]);

                return [
                    'answer' => $data['answer'] ?? '',
                    'sources' => $this->formatSources($data['sources'] ?? []),
                    'confidence' => $data['confidence'] ?? 0.0,
                    'model' => $data['model'] ?? 'persian-llm-v1',
                    'tokens_used' => $data['tokens_used'] ?? 0,
                    'generation_time' => $generationTime,
                    'ai_response_id' => $aiResponse->id,
                ];
            }

            Log::error('AI Service error: ' . $response->body());
            
            return $this->getFallbackAnswer($query);

        } catch (\Exception $e) {
            Log::error('AI Service exception: ' . $e->getMessage());
            return $this->getFallbackAnswer($query);
        }
    }

    public function generateAnswerStreamed(string $query, array $context = [], callable $callback): void
    {
        try {
            Http::timeout(120)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                    'Accept' => 'text/event-stream',
                ])
                ->withBody(json_encode([
                    'query' => $query,
                    'context' => $context,
                    'language' => $options['language'] ?? 'fa',
                    'stream' => true,
                ]))
                ->send('POST', "{$this->apiUrl}/api/v1/generate/stream", [
                    'stream' => function ($chunk) use ($callback) {
                        $callback($chunk);
                    },
                ]);

        } catch (\Exception $e) {
            Log::error('AI streaming error: ' . $e->getMessage());
            $callback(json_encode(['error' => 'Streaming failed']));
        }
    }

    public function analyzeSentiment(string $text, string $language = 'fa'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/sentiment", [
                    'text' => $text,
                    'language' => $language,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['sentiment' => 'neutral', 'score' => 0.5];

        } catch (\Exception $e) {
            Log::error('Sentiment analysis error: ' . $e->getMessage());
            return ['sentiment' => 'neutral', 'score' => 0.5];
        }
    }

    public function extractEntities(string $text, string $language = 'fa'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/entities", [
                    'text' => $text,
                    'language' => $language,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['entities' => []];

        } catch (\Exception $e) {
            Log::error('Entity extraction error: ' . $e->getMessage());
            return ['entities' => []];
        }
    }

    public function correctSpelling(string $text, string $language = 'fa'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/spell-check", [
                    'text' => $text,
                    'language' => $language,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['corrected_text' => $text, 'corrections' => []];

        } catch (\Exception $e) {
            Log::error('Spell check error: ' . $e->getMessage());
            return ['corrected_text' => $text, 'corrections' => []];
        }
    }

    public function summarizeText(string $text, int $maxLength = 200, string $language = 'fa'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/summarize", [
                    'text' => $text,
                    'max_length' => $maxLength,
                    'language' => $language,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['summary' => substr($text, 0, $maxLength)];

        } catch (\Exception $e) {
            Log::error('Summarization error: ' . $e->getMessage());
            return ['summary' => substr($text, 0, $maxLength)];
        }
    }

    public function translateText(string $text, string $from, string $to): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/translate", [
                    'text' => $text,
                    'from' => $from,
                    'to' => $to,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['translated_text' => $text];

        } catch (\Exception $e) {
            Log::error('Translation error: ' . $e->getMessage());
            return ['translated_text' => $text];
        }
    }

    public function generateSEOContent(array $data): array
    {
        try {
            $response = Http::timeout(60)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/seo-generate", [
                    'url' => $data['url'] ?? '',
                    'content' => $data['content'] ?? '',
                    'keywords' => $data['keywords'] ?? [],
                    'language' => $data['language'] ?? 'fa',
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [];

        } catch (\Exception $e) {
            Log::error('SEO generation error: ' . $e->getMessage());
            return [];
        }
    }

    public function getEmbedding(string $text, string $model = 'persian-embedding-v1'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/embedding", [
                    'text' => $text,
                    'model' => $model,
                ]);

            if ($response->successful()) {
                return $response->json('embedding', []);
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Embedding error: ' . $e->getMessage());
            return [];
        }
    }

    public function classifyText(string $text, array $categories, string $language = 'fa'): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'Authorization' => "Bearer {$this->apiKey}",
                    'Content-Type' => 'application/json',
                ])
                ->post("{$this->apiUrl}/api/v1/classify", [
                    'text' => $text,
                    'categories' => $categories,
                    'language' => $language,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return ['category' => 'other', 'confidence' => 0.0];

        } catch (\Exception $e) {
            Log::error('Classification error: ' . $e->getMessage());
            return ['category' => 'other', 'confidence' => 0.0];
        }
    }

    public function answerFeedback(int $aiResponseId, bool $isHelpful, ?string $comment = null): bool
    {
        $aiResponse = AiResponse::find($aiResponseId);
        
        if (!$aiResponse) {
            return false;
        }

        $aiResponse->update([
            'is_helpful' => $isHelpful,
            'feedback_comment' => $comment,
        ]);

        return true;
    }

    protected function formatSources(array $sources): array
    {
        $formatted = [];
        
        foreach ($sources as $source) {
            $formatted[] = [
                'title' => $source['title'] ?? '',
                'url' => $source['url'] ?? '',
                'snippet' => $source['snippet'] ?? '',
                'relevance_score' => $source['relevance_score'] ?? 0.0,
            ];
        }

        return $formatted;
    }

    protected function getFallbackAnswer(string $query): array
    {
        return [
            'answer' => "متأسفانه در حال حاضر نمی‌توانم به سوال شما پاسخ دهم. لطفاً سوال خود را به شکل دیگری مطرح کنید یا از جستجوی معمولی استفاده نمایید.",
            'sources' => [],
            'confidence' => 0.0,
            'model' => 'fallback',
            'tokens_used' => 0,
            'generation_time' => 0,
            'ai_response_id' => null,
        ];
    }

    public function isAvailable(): bool
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->apiUrl}/health");
            
            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }
}
