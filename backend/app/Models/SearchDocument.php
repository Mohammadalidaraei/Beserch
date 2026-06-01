<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class SearchDocument extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'crawl_page_id',
        'url',
        'domain',
        'title',
        'content',
        'meta_description',
        'meta_keywords',
        'headings',
        'language',
        'word_count',
        'page_rank',
        'bm25_score',
        'ai_score',
        'user_signals',
        'freshness_score',
        'authority_score',
        'content_quality_score',
        'mobile_friendly',
        'page_speed_score',
        'ssl_enabled',
        'indexed',
        'last_crawled_at',
        'last_indexed_at',
    ];

    protected $casts = [
        'headings' => 'array',
        'user_signals' => 'array',
        'mobile_friendly' => 'boolean',
        'ssl_enabled' => 'boolean',
        'indexed' => 'boolean',
        'last_crawled_at' => 'datetime',
        'last_indexed_at' => 'datetime',
    ];

    public function toSearchableArray(): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'url' => $this->url,
            'domain' => $this->domain,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords ?? '',
            'headings' => implode(' ', $this->headings ?? []),
            'language' => $this->language ?? 'fa',
            'word_count' => $this->word_count ?? 0,
            'page_rank' => $this->page_rank ?? 0,
            'authority_score' => $this->authority_score ?? 0,
            'freshness_score' => $this->freshness_score ?? 0,
            'content_quality_score' => $this->content_quality_score ?? 0,
        ];
    }

    public function crawlPage()
    {
        return $this->belongsTo(CrawlPage::class);
    }

    public function searchAnalytics()
    {
        return $this->hasMany(SearchAnalytics::class);
    }

    public function calculateFreshnessScore(): float
    {
        if (!$this->last_crawled_at) {
            return 0;
        }

        $daysSinceCrawl = now()->diffInDays($this->last_crawled_at);
        
        // Fresh content gets higher score
        if ($daysSinceCrawl <= 1) {
            return 1.0;
        } elseif ($daysSinceCrawl <= 7) {
            return 0.9;
        } elseif ($daysSinceCrawl <= 30) {
            return 0.7;
        } elseif ($daysSinceCrawl <= 90) {
            return 0.5;
        } else {
            return 0.3;
        }
    }

    public function updateScores(): void
    {
        $this->update([
            'freshness_score' => $this->calculateFreshnessScore(),
        ]);
    }
}
