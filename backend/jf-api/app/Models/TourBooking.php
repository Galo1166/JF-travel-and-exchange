<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourBooking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tour_id',
        'booking_date',
        'travel_date',
        'number_of_travelers',
        'total_price',
        'currency',
        'status',
        'full_name',
        'email',
        'phone',
        'payment_method',
        'booking_type',    // 'tour' or 'flight'
        'tour_name',       // Can be tour name or flight route
        'airline',         // Flight-specific
        'flight_class',    // Flight-specific: economy, business, first
        'flight_from',     // Flight-specific
        'flight_to',       // Flight-specific
    ];

    protected $casts = [
        'booking_date' => 'date',
        'travel_date' => 'date',
        'total_price' => 'decimal:2',
    ];

    /**
     * Get the user that made this booking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the tour being booked
     */
    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
