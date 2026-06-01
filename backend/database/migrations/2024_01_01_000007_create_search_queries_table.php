<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_queries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('query');
            $table->string('language', 10)->default('fa');
            $table->integer('results_count')->default(0);
            $table->float('response_time', 8, 4)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->index('query');
            $table->index('language');
            $table->index('created_at');
        });

        Schema::create('search_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('search_query_id')->constrained()->onDelete('cascade');
            $table->foreignId('search_document_id')->constrained()->onDelete('cascade');
            $table->integer('position')->default(0);
            $table->timestamp('clicked_at');
            
            $table->index('search_query_id');
            $table->index('search_document_id');
            $table->index('position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_clicks');
        Schema::dropIfExists('search_queries');
    }
};
