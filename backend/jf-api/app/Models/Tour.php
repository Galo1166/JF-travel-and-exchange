<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'destination',
        'country',
        'price',
        'duration',
        'rating',
        'image',
        'description',
        'itinerary',
        'included',
        'excluded',
        'category',
        'group_size',
    ];

    protected $hidden = [];

    protected $casts = [
        'itinerary' => 'array',
        'included' => 'array',
        'excluded' => 'array',
        'price' => 'decimal:2',
        'rating' => 'decimal:1',
    ];

    protected $appends = ['groupSize'];

    /**
     * Get the group size using camelCase for API response
     */
    public function getGroupSizeAttribute()
    {
        return $this->attributes['group_size'] ?? null;
    }

    /**
     * Get all bookings for this tour
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(TourBooking::class);
    }
}
