<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('search_query_id')->nullable()->constrained()->onDelete('set null');
            $table->text('query');
            $table->longText('response');
            $table->json('sources')->nullable(); // Array of source documents used
            $table->string('model_used')->default('persian-llm-v1');
            $table->float('confidence_score', 5, 4)->nullable();
            $table->integer('tokens_used')->default(0);
            $table->float('generation_time', 8, 4)->nullable();
            $table->boolean('is_helpful')->nullable(); // User feedback
            $table->text('feedback_comment')->nullable();
            $table->timestamps();

            $table->index('created_at');
            $table->index('model_used');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_responses');
    }
};
