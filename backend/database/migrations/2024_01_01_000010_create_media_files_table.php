<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crawl_page_id')->constrained()->onDelete('cascade');
            $table->string('url');
            $table->enum('type', ['image', 'video', 'audio', 'document'])->default('image');
            $table->string('mime_type');
            $table->bigInteger('file_size')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->integer('duration')->nullable(); // For videos/audio in seconds
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->json('thumbnails')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_indexed')->default(true);
            $table->timestamps();

            $table->index('type');
            $table->index('is_indexed');
            $table->fullText(['alt_text', 'title', 'description']);
        });

        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_file_id')->constrained()->onDelete('cascade');
            $table->string('source'); // YouTube, Aparat, etc.
            $table->string('source_id')->nullable();
            $table->string('embed_url')->nullable();
            $table->integer('view_count')->default(0);
            $table->string('channel')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index('source');
            $table->index('source_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
        Schema::dropIfExists('media_files');
    }
};
