<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crawl_page_id')->constrained()->onDelete('cascade');
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->text('url');
            $table->string('language', 10)->default('fa');
            $table->json('keywords')->nullable();
            $table->float('score', 10, 4)->default(0); // BM25 + PageRank combined score
            $table->float('pagerank', 10, 4)->default(0);
            $table->integer('word_count')->default(0);
            $table->integer('in_links_count')->default(0);
            $table->integer('out_links_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('language');
            $table->index('score');
            $table->index('is_active');
            $table->fullText(['title', 'content']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_documents');
    }
};
