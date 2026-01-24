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
            // Add currency column (was missing)
            if (!Schema::hasColumn('tour_bookings', 'currency')) {
                $table->string('currency', 3)->nullable()->after('total_price');
            }
            
            // Add flight booking support
            if (!Schema::hasColumn('tour_bookings', 'booking_type')) {
                $table->enum('booking_type', ['tour', 'flight'])->default('tour')->after('payment_method');
            }
            
            if (!Schema::hasColumn('tour_bookings', 'tour_name')) {
                $table->string('tour_name')->nullable()->after('booking_type');
            }
            
            if (!Schema::hasColumn('tour_bookings', 'airline')) {
                $table->string('airline')->nullable()->after('tour_name');
            }
            
            if (!Schema::hasColumn('tour_bookings', 'flight_class')) {
                $table->enum('flight_class', ['economy', 'business', 'first'])->nullable()->after('airline');
            }
            
            if (!Schema::hasColumn('tour_bookings', 'flight_from')) {
                $table->string('flight_from', 10)->nullable()->after('flight_class');
            }
            
            if (!Schema::hasColumn('tour_bookings', 'flight_to')) {
                $table->string('flight_to', 10)->nullable()->after('flight_from');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_bookings', function (Blueprint $table) {
            $table->dropColumn([
                'currency',
                'booking_type',
                'tour_name',
                'airline',
                'flight_class',
                'flight_from',
                'flight_to',
            ]);
        });
    }
};
