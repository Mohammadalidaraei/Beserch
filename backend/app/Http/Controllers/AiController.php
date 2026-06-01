<?php

namespace App\Http\Controllers;

use App\Services\AI\AiSearchService;
use App\Services\Search\SearchService;
use App\Models\AiResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    protected AiSearchService $aiService;
    protected SearchService $searchService;

    public function __construct(AiSearchService $aiService, SearchService $searchService)
    {
        $this->aiService = $aiService;
        $this->searchService = $searchService;
    }

    public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|max:500',
            'language' => 'sometimes|in:fa,en,ar',
            'stream' => 'sometimes|boolean',
        ]);

        $query = trim($request->input('query'));
        $language = $request->input('language', 'fa');
        $stream = $request->input('stream', false);

        // First, perform regular search to get context
        $searchResults = $this->searchService->search($query, [
            'per_page' => 10,
            'language' => $language,
        ]);

        // Prepare context from search results
        $context = [];
        foreach ($searchResults['results'] ?? [] as $result) {
            $context[] = [
                'title' => $result['title'],
                'content' => strip_tags($result['description']),
                'url' => $result['url'],
                'score' => $result['score'],
            ];
        }

        if ($stream) {
            return response()->stream(function () use ($query, $context, $language) {
                $this->aiService->generateAnswerStreamed($query, $context, function ($chunk) {
                    echo "data: " . $chunk . "\n\n";
                    ob_flush();
                    flush();
                });
            }, 200, [
                'Content-Type' => 'text/event-stream',
                'Cache-Control' => 'no-cache',
                'X-Accel-Buffering' => 'no',
            ]);
        }

        try {
            $answer = $this->aiService->generateAnswer($query, $context, [
                'language' => $language,
                'max_tokens' => 1024,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'answer' => $answer['answer'],
                    'sources' => $answer['sources'],
                    'confidence' => $answer['confidence'],
                    'model' => $answer['model'],
                    'generation_time' => $answer['generation_time'],
                    'search_results_count' => count($searchResults['results'] ?? []),
                ],
                'query' => $query,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'AI search failed',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    public function feedback(Request $request)
    {
        $request->validate([
            'response_id' => 'required|integer|exists:ai_responses,id',
            'is_helpful' => 'required|boolean',
            'comment' => 'sometimes|nullable|string|max:1000',
        ]);

        $success = $this->aiService->answerFeedback(
            $request->input('response_id'),
            $request->input('is_helpful'),
            $request->input('comment')
        );

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Thank you for your feedback' : 'Failed to submit feedback',
        ]);
    }
}
