<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('farm_settings', function (Blueprint $table) {
            $table->string('tagline', 500)->nullable()->after('farm_name');
            $table->text('description')->nullable()->after('tagline');
        });
    }

    public function down(): void
    {
        Schema::table('farm_settings', function (Blueprint $table) {
            $table->dropColumn(['tagline', 'description']);
        });
    }
};
