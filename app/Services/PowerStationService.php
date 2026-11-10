<?php

namespace App\Services;

use App\Models\PowerStation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PowerStationService
{
    private function sanitize(array $data): array
    {
        foreach (['station_code', 'station_status'] as $field) {
            if (isset($data[$field])) {
                $data[$field] = trim(strip_tags($data[$field]));

                if ($field === 'station_code') {
                    $data[$field] = strtoupper($data[$field]);
                }
            }
        }

        return $data;
    }

    private function checkConstraints(array $data): void
    {
        if (isset($data['station_code']) && $data['station_code'] === '') {
            throw ValidationException::withMessages([
                'station_code' => 'Station code cannot be empty.',
            ]);
        }

        if (isset($data['station_code']) && strlen($data['station_code']) > 100) {
            throw ValidationException::withMessages([
            'station_code' => 'Station code must not exceed 100 characters.',
            ]);
        }

        if (isset($data['station_status']) && $data['station_status'] === '') {
            throw ValidationException::withMessages([
                'station_status' => 'Station status cannot be empty.',
            ]);
        }
    }

    public function create(array $data): PowerStation
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            return PowerStation::create($data);
        });
    }

    public function update(PowerStation $station, array $data): PowerStation
    {
        return DB::transaction(function () use ($station, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            $station->update($data);

            return $station->refresh();
        });
    }

    public function delete(PowerStation $station): void
    {
        DB::transaction(fn () => $station->delete());
    }
}
