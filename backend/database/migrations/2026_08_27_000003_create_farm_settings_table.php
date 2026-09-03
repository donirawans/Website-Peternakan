<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('farm_settings', function (Blueprint $table) {
            $table->id();
            $table->string('farm_name', 255)->nullable();
            $table->string('whatsapp_number', 50)->nullable();
            $table->string('visiting_hours', 255)->nullable();
            $table->text('address')->nullable();
            $table->text('google_maps_url')->nullable();
            $table->text('truck_access_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('farm_settings');
    }
};
