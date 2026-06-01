<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CrawlPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'crawl_job_id',
        'url',
        'domain',
        'status_code',
        'content_type',
        'content_length',
        'title',
        'meta_description',
        'meta_keywords',
        'headings',
        'links',
        'images',
        'html_content',
        'text_content',
        'language',
        'word_count',
        'load_time_ms',
        'error_message',
        'crawled_at',
        'indexed',
        'indexed_at',
    ];

    protected $casts = [
        'crawled_at' => 'datetime',
        'indexed_at' => 'datetime',
        'deleted_at' => 'datetime',
        'headings' => 'array',
        'links' => 'array',
        'images' => 'array',
        'indexed' => 'boolean',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_SUCCESS = 'success';
    const STATUS_FAILED = 'failed';
    const STATUS_SKIPPED = 'skipped';

    public function crawlJob()
    {
        return $this->belongsTo(CrawlJob::class);
    }

    public function searchDocuments()
    {
        return $this->hasMany(SearchDocument::class);
    }

    public function isSuccess(): bool
    {
        return $this->status_code >= 200 && $this->status_code < 300;
    }

    public function isRedirect(): bool
    {
        return $this->status_code >= 300 && $this->status_code < 400;
    }

    public function isError(): bool
    {
        return $this->status_code >= 400;
    }

    public function extractLinks(): array
    {
        preg_match_all('/<a\s+(?:[^>]*?\s+)?href=["\'](.*?)["\']/i', $this->html_content ?? '', $matches);
        return array_unique($matches[1] ?? []);
    }

    public function extractImages(): array
    {
        preg_match_all('/<img\s+[^>]*src=["\']([^"\']+)["\']/i', $this->html_content ?? '', $matches);
        return array_unique($matches[1] ?? []);
    }

    public function extractHeadings(): array
    {
        $headings = [];
        
        foreach (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as $tag) {
            preg_match_all("/<{$tag}[^>]*>(.*?)<\/{$tag}>/i", $this->html_content ?? '', $matches);
            $headings[$tag] = array_map('strip_tags', $matches[1] ?? []);
        }
        
        return $headings;
    }
}
