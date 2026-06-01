<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Website extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'domain',
        'url',
        'sitemap_url',
        'status',
        'verified',
        'verification_token',
        'verified_at',
        'last_crawled_at',
        'total_pages',
        'indexed_pages',
        'crawl_errors',
        'average_position',
        'total_clicks',
        'total_impressions',
    ];

    protected $casts = [
        'verified' => 'boolean',
        'verified_at' => 'datetime',
        'last_crawled_at' => 'datetime',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_PENDING = 'pending';
    const STATUS_SUSPENDED = 'suspended';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function crawlJobs(): HasMany
    {
        return $this->hasMany(CrawlJob::class, 'domain', 'domain');
    }

    public function searchAnalytics(): HasMany
    {
        return $this->hasMany(SearchAnalytics::class, 'domain', 'domain');
    }

    public function isVerified(): bool
    {
        return $this->verified && $this->verified_at !== null;
    }

    public function markAsVerified(): void
    {
        $this->update([
            'verified' => true,
            'verified_at' => now(),
        ]);
    }

    public function generateVerificationToken(): string
    {
        $token = bin2hex(random_bytes(16));
        $this->update(['verification_token' => $token]);
        return $token;
    }

    public function getDomainAttribute(): string
    {
        return parse_url($this->attributes['url'] ?? '', PHP_URL_HOST) ?? '';
    }
}
