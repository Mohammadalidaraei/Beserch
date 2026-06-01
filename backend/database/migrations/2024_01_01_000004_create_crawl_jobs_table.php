<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crawl_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['full', 'incremental', 'sitemap', 'single_url'])->default('incremental');
            $table->enum('status', ['pending', 'running', 'paused', 'completed', 'failed'])->default('pending');
            $table->integer('total_urls')->default(0);
            $table->integer('processed_urls')->default(0);
            $table->integer('failed_urls')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('website_id');
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawl_jobs');
    }
};
