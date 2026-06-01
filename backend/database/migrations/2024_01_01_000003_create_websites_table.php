<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('websites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('url')->unique();
            $table->string('sitemap_url')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->enum('status', ['pending', 'crawling', 'indexed', 'error', 'disabled'])->default('pending');
            $table->integer('total_pages')->default(0);
            $table->integer('indexed_pages')->default(0);
            $table->timestamp('last_crawled_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->json('verification_token')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('url');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('websites');
    }
};
