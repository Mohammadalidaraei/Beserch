<?php

namespace App\Http\Controllers;

use App\Services\Search\SearchService;
use App\Services\AI\AiSearchService;
use App\Models\SearchQuery;
use App\Models\SearchDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    protected SearchService $searchService;
    protected AiSearchService $aiService;

    public function __construct(SearchService $searchService, AiSearchService $aiService)
    {
        $this->searchService = $searchService;
        $this->aiService = $aiService;
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|max:500',
            'type' => 'sometimes|in:web,images,videos,news',
            'page' => 'sometimes|integer|min:1',
            'per_page' => 'sometimes|integer|min:1|max:50',
            'language' => 'sometimes|in:fa,en,ar',
            'sort' => 'sometimes|in:relevance,date,newest,oldest',
        ]);

        $query = trim($request->input('q'));
        $type = $request->input('type', 'web');
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 10);
        $language = $request->input('language', 'fa');
        $sort = $request->input('sort', 'relevance');

        // Log search query
        $searchQuery = SearchQuery::create([
            'query' => $query,
            'language' => $language,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $startTime = microtime(true);

        try {
            switch ($type) {
                case 'images':
                    $results = $this->searchService->imageSearch($query, [
                        'page' => $page,
                        'per_page' => $perPage,
                    ]);
                    break;
                    
                case 'videos':
                    $results = $this->searchService->videoSearch($query, [
                        'page' => $page,
                        'per_page' => $perPage,
                        'sort' => $sort,
                    ]);
                    break;
                    
                case 'news':
                    $results = $this->searchService->newsSearch($query, [
                        'page' => $page,
                        'per_page' => $perPage,
                        'date_range' => $request->input('date_range'),
                    ]);
                    break;
                    
                default:
                    $results = $this->searchService->search($query, [
                        'page' => $page,
                        'per_page' => $perPage,
                        'language' => $language,
                        'sort' => $sort,
                        'filters' => [
                            'site' => $request->input('site'),
                            'date_range' => $request->input('date_range'),
                        ],
                    ]);
            }

            $responseTime = microtime(true) - $startTime;

            // Update search query with results
            $searchQuery->update([
                'results_count' => $results['total'] ?? 0,
                'response_time' => $responseTime,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $results['results'] ?? [],
                    'total' => $results['total'] ?? 0,
                    'took' => $results['took'] ?? 0,
                    'page' => $page,
                    'per_page' => $perPage,
                    'total_pages' => ceil(($results['total'] ?? 0) / $perPage),
                ],
                'query' => $query,
                'type' => $type,
                'response_time' => $responseTime,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Search failed',
                'message' => config('app.debug') ? $e->getMessage() : 'An error occurred',
            ], 500);
        }
    }

    public function suggestions(Request $request)
    {
        $request->validate([
            'q' => 'required|string|max:100',
            'language' => 'sometimes|in:fa,en,ar',
        ]);

        $query = trim($request->input('q'));
        $language = $request->input('language', 'fa');

        try {
            $suggestions = $this->searchService->suggest($query, $language);

            return response()->json([
                'success' => true,
                'data' => [
                    'query' => $query,
                    'suggestions' => $suggestions,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'data' => [
                    'query' => $query,
                    'suggestions' => [],
                ],
            ]);
        }
    }

    public function imageSearch(Request $request)
    {
        return $this->search($request);
    }

    public function videoSearch(Request $request)
    {
        return $this->search($request);
    }

    public function newsSearch(Request $request)
    {
        return $this->search($request);
    }
}
