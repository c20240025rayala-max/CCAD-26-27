<?php

namespace App\Services;

use App\Models\GridZone;
use Illuminate\Support\Facades\DB;

class GridZoneService
{
    public function create(array $data): GridZone
    {
        return DB::transaction(function () use ($data) {
            return GridZone::create($data);
        });
    }

    public function update(GridZone $gridZone, array $data): GridZone
    {
        return DB::transaction(function () use ($gridZone, $data) {
            $gridZone->update($data);

            return $gridZone->refresh();
        });
    }
}
