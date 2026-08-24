<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaborators', function (Blueprint $table) {
            $table->id();
            $table->string('diagram_id', 12)->index();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete(); // null until the email registers
            $table->string('email');
            $table->string('role', 20)->default('commenter'); // commenter | editor
            $table->foreignId('invited_by')->constrained('users');
            $table->timestampsTz();
            $table->unique(['diagram_id', 'email']);
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->string('diagram_id', 12)->index();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->string('anchor_type', 10)->nullable(); // node | edge
            $table->string('anchor_id', 64)->nullable();
            $table->text('body');
            $table->timestampTz('resolved_at')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
        Schema::dropIfExists('collaborators');
    }
};
