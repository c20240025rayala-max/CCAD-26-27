<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Operator extends Model
{

    protected $primaryKey = 'operator_id';

    protected $fillable = [
        'operator_name',
    ];

    public function powerStations(): HasMany
    {
        return $this->hasMany(
            PowerStation::class,
            'operator_id',
            'operator_id'
        );
    }
}
