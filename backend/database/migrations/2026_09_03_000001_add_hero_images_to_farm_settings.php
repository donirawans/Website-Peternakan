<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('farm_settings', function (Blueprint $table) {
            $table->string('hero_image_1', 1000)->nullable()->after('truck_access_note');
            $table->string('hero_image_2', 1000)->nullable()->after('hero_image_1');
            $table->string('hero_image_3', 1000)->nullable()->after('hero_image_2');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('farm_settings', function (Blueprint $table) {
            $table->dropColumn(['hero_image_1', 'hero_image_2', 'hero_image_3']);
        });
    }
};
