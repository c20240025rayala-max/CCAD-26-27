<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PowerStation extends Model
{
    protected $primaryKey = 'station_code';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'station_code',
        'station_type_id',
        'operator_id',
        'grid_zone_id',
        'station_status',
    ];

    public function stationType(): BelongsTo
    {
        return $this->belongsTo(
            StationType::class,
            'station_type_id',
            'station_type_id'
        );
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(
            Operator::class,
            'operator_id',
            'operator_id'
        );
    }

    public function gridZone(): BelongsTo
    {
        return $this->belongsTo(
            GridZone::class,
            'grid_zone_id',
            'grid_zone_id'
        );
    }

    public function readings(): HasMany
    {
        return $this->hasMany(
            PowerReading::class,
            'station_code',
            'station_code'
        );
    }
}
