<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class PowerReading extends Model
{
    protected $primaryKey = 'reading_id';

    protected $fillable = [
        'station_code',
        'kwh_generated',
        'peak_mw',
        'reading_timestamp',
        'feed_in_tariff_rate',
    ];

    protected function casts(): array
    {
        return [
            'kwh_generated' => 'decimal:3',
            'peak_mw' => 'decimal:3',
            'reading_timestamp' => 'datetime',
            'feed_in_tariff_rate' => 'decimal:4',
        ];
    }

    public function station(): BelongsTo
    {
        return $this->belongsTo(
            PowerStation::class,
            'station_code',
            'station_code'
        );
    }

    public function getGrossPayoutAttribute(): string
    {
        return number_format(
            (float) $this->kwh_generated
                * (float) $this->feed_in_tariff_rate,
            2,
            '.',
            ''
        );
    }
}
