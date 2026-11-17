<?php

namespace App\Services;

use App\Models\PowerStation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PowerStationService
{
    private function sanitize(array $data): array
    {
        if (isset($data['station_status'])) {
            $data['station_status'] = trim(strip_tags($data['station_status']));
        }

        return $data;
    }

    private function generateStationCode(): string
    {
        do {
            $stationCode = 'PS-'.Str::ulid();
        } while (PowerStation::whereKey($stationCode)->exists());

        return $stationCode;
    }

    private function checkConstraints(array $data): void
    {
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
            $data['station_code'] = $this->generateStationCode();

            return PowerStation::create($data);
        });
    }

    public function update(PowerStation $station, array $data): PowerStation
    {
        return DB::transaction(function () use ($station, $data) {
            unset($data['station_code']);
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
