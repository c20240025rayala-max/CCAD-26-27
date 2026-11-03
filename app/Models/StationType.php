<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StationType extends Model
{
    protected $primaryKey = 'station_type_id';
    protected $fillable = [
        'type_name',
    ];

    public function powerStations(): HasMany
    {
        return $this->hasMany(
            PowerStation::class,
            'station_type_id',
            'station_type_id'
        );
    }
}
