<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cattle', function (Blueprint $table) {
            $table->id();
            $table->string('ear_tag', 100)->unique();
            $table->string('name', 255);
            $table->string('breed', 100)->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('age_phase', 100)->nullable();
            $table->integer('weight')->default(0);
            $table->bigInteger('price')->default(0);
            $table->string('status', 50)->default('Tersedia');
            $table->text('feed_pattern')->nullable();
            $table->text('care_notes')->nullable();
            $table->json('media_urls')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cattle');
    }
};
