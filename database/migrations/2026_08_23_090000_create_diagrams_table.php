<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diagrams', function (Blueprint $table) {
            $table->string('id', 12)->primary(); // base58 short id
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('forked_from_id', 12)->nullable()->index();
            $table->string('title', 200);
            $table->string('view', 20)->default('services'); // services|dataflow|schema|deploy
            $table->string('visibility', 20)->default('unlisted'); // public|unlisted|private
            $table->string('claim_token_hash', 64)->nullable();
            $table->jsonb('doc');
            $table->jsonb('layout')->nullable();
            $table->timestampTz('expires_at')->nullable()->index();
            $table->timestampsTz();
        });

        Schema::create('diagram_versions', function (Blueprint $table) {
            $table->id();
            $table->string('diagram_id', 12)->index();
            $table->unsignedInteger('seq');
            $table->jsonb('doc');
            $table->foreignId('author_id')->nullable();
            $table->timestampTz('created_at')->nullable();
            $table->unique(['diagram_id', 'seq']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diagram_versions');
        Schema::dropIfExists('diagrams');
    }
};
