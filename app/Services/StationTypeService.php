<?php

namespace App\Services;

use App\Models\StationType;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StationTypeService
{
    private function sanitize(array $data): array
    {
        if (isset($data['type_name'])) {
            $data['type_name'] = trim(strip_tags($data['type_name']));
        }

        return $data;
    }

    private function checkConstraints(array $data): void
    {
        if (isset($data['type_name']) && $data['type_name'] === '') {
            throw ValidationException::withMessages([
                'type_name' => 'Station type name cannot be empty.',
            ]);
        }

        if (isset($data['type_name']) && strlen($data['type_name']) > 100) {
            throw ValidationException::withMessages([
                'type_name' => 'Station type name must not exceed 100 characters.',
            ]);
        }
    }

    public function create(array $data): StationType
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            return StationType::create($data);
        });
    }

    public function update(StationType $stationType, array $data): StationType
    {
        return DB::transaction(function () use ($stationType, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            $stationType->update($data);

            return $stationType->refresh();
        });
    }
}
