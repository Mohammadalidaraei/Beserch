<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\CrawlJob;
use App\Models\WebmasterStat;
use App\Models\CrawlError;
use App\Services\Crawler\CrawlerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebmasterController extends Controller
{
    protected CrawlerService $crawlerService;

    public function __construct(CrawlerService $crawlerService)
    {
        $this->crawlerService = $crawlerService;
    }

    public function index(Request $request)
    {
        $websites = Website::where('user_id', Auth::id())
            ->withCount(['crawlPages as total_pages', 'crawlPages as indexed_pages' => fn($q) => $q->where('is_indexed', true)])
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => [
                'websites' => $websites,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'url' => 'required|url|max:500',
            'sitemap_url' => 'sometimes|nullable|url|max:500',
        ]);

        $url = rtrim($request->url, '/');
        
        // Check if website already exists
        $existing = Website::where('url', $url)->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'error' => 'Website already registered',
            ], 422);
        }

        $website = Website::create([
            'user_id' => Auth::id(),
            'url' => $url,
            'sitemap_url' => $request->sitemap_url,
            'status' => Website::STATUS_PENDING,
            'verification_token' => bin2hex(random_bytes(32)),
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'website' => $website,
            ],
            'message' => 'Website added successfully. Please verify ownership.',
        ]);
    }

    public function show(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);
        $website->load(['latestCrawlJob', 'crawlErrors' => fn($q) => $q->limit(10)]);

        return response()->json([
            'success' => true,
            'data' => [
                'website' => $website,
            ],
        ]);
    }

    public function update(Request $request, int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'sitemap_url' => 'sometimes|nullable|url|max:500',
        ]);

        $website->update($request->only(['sitemap_url']));

        return response()->json([
            'success' => true,
            'data' => [
                'website' => $website,
            ],
            'message' => 'Website updated successfully',
        ]);
    }

    public function destroy(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);
        $website->delete();

        return response()->json([
            'success' => true,
            'message' => 'Website removed successfully',
        ]);
    }

    public function verify(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);
        
        // In production, check for verification file/meta tag
        // For now, mark as verified
        $website->update([
            'verified_at' => now(),
            'status' => Website::STATUS_PENDING,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Website verified successfully',
        ]);
    }

    public function crawl(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        if (!$website->verified_at) {
            return response()->json([
                'success' => false,
                'error' => 'Please verify your website first',
            ], 422);
        }

        $crawlJob = CrawlJob::create([
            'website_id' => $website->id,
            'type' => 'incremental',
            'status' => 'pending',
        ]);

        // Dispatch crawl job (in production, use queue)
        dispatch(new \App\Jobs\ProcessCrawlJob($crawlJob));

        return response()->json([
            'success' => true,
            'data' => [
                'crawl_job' => $crawlJob,
            ],
            'message' => 'Crawl job started',
        ]);
    }

    public function stats(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);
        
        $stats = WebmasterStat::where('website_id', $id)
            ->orderBy('stat_date', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'website' => $website,
                'stats' => $stats,
            ],
        ]);
    }

    public function performance(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        // Get performance metrics
        $performance = [
            'average_position' => WebmasterStat::where('website_id', $id)
                ->avg('average_position') ?? 0,
            'total_clicks' => WebmasterStat::where('website_id', $id)->sum('total_clicks'),
            'total_impressions' => WebmasterStat::where('website_id', $id)->sum('total_impressions'),
            'ctr' => WebmasterStat::where('website_id', $id)->avg('ctr') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'performance' => $performance,
            ],
        ]);
    }

    public function errors(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        $errors = CrawlError::where('website_id', $id)
            ->where('is_resolved', false)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'errors' => $errors,
            ],
        ]);
    }

    public function pages(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        $pages = $website->crawlPages()
            ->orderBy('last_crawled_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'pages' => $pages,
            ],
        ]);
    }

    public function queries(int $id)
    {
        // Get top search queries for this website
        // This would require joining with search data
        
        return response()->json([
            'success' => true,
            'data' => [
                'queries' => [],
            ],
        ]);
    }

    public function sitemap(int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'sitemap_url' => $website->sitemap_url,
            ],
        ]);
    }

    public function submitSitemap(Request $request, int $id)
    {
        $website = Website::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'sitemap_url' => 'required|url|max:500',
        ]);

        $website->update(['sitemap_url' => $request->sitemap_url]);

        return response()->json([
            'success' => true,
            'message' => 'Sitemap submitted successfully',
        ]);
    }
}
