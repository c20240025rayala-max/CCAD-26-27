<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GridZone extends Model
{
    protected $primaryKey = 'grid_zone_id';
    protected $fillable = [
        'zone_name',
    ];
    public function powerStations(): HasMany
    {
        return $this->hasMany(
            PowerStation::class,
            'grid_zone_id',
            'grid_zone_id'
        );
    }
}
