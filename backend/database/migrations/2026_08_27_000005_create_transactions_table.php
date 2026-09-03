<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 100)->unique();
            $table->unsignedBigInteger('cattle_id');
            $table->string('buyer_name', 255);
            $table->string('buyer_phone', 50)->nullable();
            $table->string('buyer_address')->nullable();
            $table->bigInteger('total_amount')->default(0);
            $table->bigInteger('dp_amount')->default(0);
            $table->string('payment_method', 100)->nullable();
            $table->string('status', 50)->default('Menunggu Konfirmasi');
            $table->date('transaction_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->foreign('cattle_id')->references('id')->on('cattle')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
