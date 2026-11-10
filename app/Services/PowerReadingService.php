<?php

namespace App\Services;

use App\Models\PowerReading;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PowerReadingService
{
    private function sanitize(array $data): array
    {
        if (isset($data['station_code'])) {
            $data['station_code'] = trim(strip_tags($data['station_code']));
        }

        return $data;
    }

    public function calculateGrossPayout(
        float $kwhGenerated,
        float $tariffRate
    ): float {
        return round($kwhGenerated * $tariffRate, 2);
    }

    private function checkConstraints(array $data): void
    {
        $numericFields = [
            'kwh_generated',
            'peak_mw',
            'feed_in_tariff_rate',
        ];

        foreach ($numericFields as $field) {
            if (isset($data[$field]) && (!is_numeric($data[$field]) || (float) $data[$field] < 0)) {
                throw ValidationException::withMessages([
                    $field => ucfirst(str_replace('_', ' ', $field)) .
                        ' must be a non-negative number.',
                ]);
            }
        }

        if (isset($data['station_code']) && $data['station_code'] === '') {
            throw ValidationException::withMessages([
                'station_code' => 'Station code cannot be empty.',
            ]);
        }
    }

    public function create(array $data): PowerReading
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            return PowerReading::create($data);
        });
    }

    public function update(PowerReading $reading, array $data): PowerReading
    {
        return DB::transaction(function () use ($reading, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);

            $reading->update($data);

            return $reading->refresh();
        });
    }

    public function delete(PowerReading $reading): void
    {
        DB::transaction(fn () => $reading->delete());
    }
}
