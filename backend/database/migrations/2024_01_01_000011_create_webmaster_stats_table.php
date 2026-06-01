<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webmaster_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->date('stat_date');
            $table->bigInteger('total_clicks')->default(0);
            $table->bigInteger('total_impressions')->default(0);
            $table->float('average_position', 8, 2)->default(0);
            $table->float('ctr', 8, 4)->default(0); // Click-through rate
            $table->json('top_queries')->nullable();
            $table->json('top_pages')->nullable();
            $table->json('top_countries')->nullable();
            $table->json('top_devices')->nullable();
            $table->timestamps();

            $table->unique(['website_id', 'stat_date']);
            $table->index('stat_date');
        });

        Schema::create('crawl_errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('website_id')->constrained()->onDelete('cascade');
            $table->foreignId('crawl_page_id')->nullable()->constrained()->onDelete('set null');
            $table->string('url');
            $table->integer('status_code')->default(0);
            $table->string('error_type'); // 404, 500, timeout, dns_error, etc.
            $table->text('error_message')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('website_id');
            $table->index('error_type');
            $table->index('is_resolved');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crawl_errors');
        Schema::dropIfExists('webmaster_stats');
    }
};
