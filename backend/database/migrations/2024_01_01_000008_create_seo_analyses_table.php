<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('url');
            $table->json('analysis_data')->nullable(); // Full analysis results
            $table->integer('score')->default(0); // 0-100 SEO score
            $table->json('issues')->nullable(); // Array of issues found
            $table->json('suggestions')->nullable(); // Array of suggestions
            $table->json('generated_fixes')->nullable(); // AI-generated fixes
            $table->enum('status', ['pending', 'analyzing', 'completed', 'failed'])->default('pending');
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('seo_analysis_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seo_analysis_id')->constrained()->onDelete('cascade');
            $table->string('category'); // title, meta, headings, images, links, etc.
            $table->string('issue_type'); // missing, duplicate, too_long, etc.
            $table->text('description');
            $table->enum('severity', ['critical', 'warning', 'info'])->default('info');
            $table->text('suggestion')->nullable();
            $table->text('ai_fix')->nullable();
            $table->boolean('is_fixed')->default(false);
            $table->timestamps();

            $table->index('seo_analysis_id');
            $table->index('category');
            $table->index('severity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_analysis_items');
        Schema::dropIfExists('seo_analyses');
    }
};
