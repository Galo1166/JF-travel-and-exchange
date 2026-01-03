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
        Schema::table('tour_bookings', function (Blueprint $table) {
            // Change total_price from decimal(10,2) to decimal(15,2) to handle larger amounts
            $table->decimal('total_price', 15, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_bookings', function (Blueprint $table) {
            $table->decimal('total_price', 10, 2)->change();
        });
    }
};
