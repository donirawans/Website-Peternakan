<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 50)->default('admin')->after('password');
            $table->string('api_token', 100)->nullable()->unique()->after('role');
            $table->string('photo_url', 500)->nullable()->after('api_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['api_token', 'photo_url', 'role']);
        });
    }
};
