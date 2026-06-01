<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawl_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->foreignId('crawl_job_id')->nullable()->constrained()->onDelete('set null');
            $table->string('url', 2048);
            $table->string('final_url', 2048)->nullable();
            $table->integer('status_code')->default(200);
            $table->text('title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('meta_keywords')->nullable();
            $table->json('headings')->nullable(); // h1, h2, h3 structure
            $table->longText('content')->nullable();
            $table->longText('html_content')->nullable();
            $table->json('links')->nullable(); // internal and external links
            $table->json('images')->nullable();
            $table->string('language', 10)->default('fa');
            $table->string('content_type')->nullable();
            $table->integer('word_count')->default(0);
            $table->bigInteger('page_size')->nullable();
            $table->float('load_time', 8, 4)->nullable();
            $table->json('schema_data')->nullable(); // Structured data
            $table->json('open_graph')->nullable();
            $table->json('twitter_cards')->nullable();
            $table->boolean('is_indexed')->default(true);
            $table->boolean('no_follow')->default(false);
            $table->boolean('no_index')->default(false);
            $table->timestamp('last_crawled_at');
            $table->timestamps();

            $table->unique(['website_id', 'url']);
            $table->index('status_code');
            $table->index('language');
            $table->index('is_indexed');
            $table->index('last_crawled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawl_pages');
    }
};
