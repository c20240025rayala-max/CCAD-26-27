<?php

namespace App\Services;

use App\Models\GridZone;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class GridZoneService
{
    private function sanitize(array $data): array
    {
        if (isset($data['zone_name'])) {
            $data['zone_name'] = trim(strip_tags($data['zone_name']));
        }

        return $data;
    }

    private function checkConstraints(array $data): void
    {
        if (isset($data['zone_name']) && $data['zone_name'] === '') {
            throw ValidationException::withMessages([
                'zone_name' => 'Grid zone name cannot be empty.',
            ]);
        }

        if (isset($data['zone_name']) && strlen($data['zone_name']) > 100) {
            throw ValidationException::withMessages([
                'zone_name' => 'Grid zone name must not exceed 100 characters.',
            ]);
        }
    }

    public function create(array $data): GridZone
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            return GridZone::create($data);
        });
    }

    public function update(GridZone $gridZone, array $data): GridZone
    {
        return DB::transaction(function () use ($gridZone, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            $gridZone->update($data);

            return $gridZone->refresh();
        });
    }
}
