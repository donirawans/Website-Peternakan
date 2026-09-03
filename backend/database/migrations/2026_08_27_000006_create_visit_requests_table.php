<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cattle_id')->nullable();
            $table->string('cattle_name', 255)->nullable();
            $table->string('buyer_name', 255);
            $table->string('buyer_phone', 50)->nullable();
            $table->date('visit_date')->nullable();
            $table->string('visit_time', 50)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_requests');
    }
};
