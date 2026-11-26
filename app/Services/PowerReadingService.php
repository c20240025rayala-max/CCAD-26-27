<?php

namespace App\Services;

use App\Models\PowerReading;
use App\Models\PowerStation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PowerReadingService
{
    private const PEAK_DROP_ALERT_PERCENT = 20;

    private const NUMERIC_FIELD_LIMITS = [
        'kwh_generated' => ['maximum' => 99999999999.999, 'formatted' => '99,999,999,999.999'],
        'peak_mw' => ['maximum' => 999999999.999, 'formatted' => '999,999,999.999'],
        'feed_in_tariff_rate' => ['maximum' => 99999999.9999, 'formatted' => '99,999,999.9999'],
    ];

    private function sanitize(array $data): array
    {
        if (isset($data['station_code'])) {
            $data['station_code'] = strtoupper(trim(strip_tags($data['station_code'])));
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
        foreach (self::NUMERIC_FIELD_LIMITS as $field => $limits) {
            if (isset($data[$field]) && (!is_numeric($data[$field]) || (float) $data[$field] < 0)) {
                throw ValidationException::withMessages([
                    $field => ucfirst(str_replace('_', ' ', $field)) .
                        ' must be a non-negative number.',
                ]);
            }

            if (isset($data[$field]) && (float) $data[$field] > $limits['maximum']) {
                throw ValidationException::withMessages([
                    $field => ucfirst(str_replace('_', ' ', $field)) .
                        ' cannot exceed ' . $limits['formatted'] . '.',
                ]);
            }
        }

        if (isset($data['station_code']) && $data['station_code'] === '') {
            throw ValidationException::withMessages([
                'station_code' => 'Station code cannot be empty.',
            ]);
        }

        if (isset($data['station_code'], $data['peak_mw'])) {
            $installedCapacity = PowerStation::query()
                ->whereKey($data['station_code'])
                ->value('installed_capacity_mw');

            if ($installedCapacity === null) {
                throw ValidationException::withMessages([
                    'station_code' => 'Set the station installed capacity before adding readings.',
                ]);
            }

            if ((float) $data['peak_mw'] > (float) $installedCapacity) {
                throw ValidationException::withMessages([
                    'peak_mw' => 'Peak output cannot exceed the station installed capacity.',
                ]);
            }
        }
    }

    private function shouldFlagPeakDrop(array $data, ?PowerReading $reading = null): bool
    {
        $stationCode = $data['station_code'] ?? $reading?->station_code;
        $timestamp = $data['reading_timestamp'] ?? $reading?->reading_timestamp;
        $peakMw = (float) ($data['peak_mw'] ?? $reading?->peak_mw);

        $previousPeakMw = PowerReading::query()
            ->where('station_code', $stationCode)
            ->where('reading_timestamp', '<', $timestamp)
            ->orderByDesc('reading_timestamp')
            ->lockForUpdate()
            ->value('peak_mw');

        if ($previousPeakMw === null || (float) $previousPeakMw <= 0) {
            return false;
        }

        $dropPercent = ((float) $previousPeakMw - $peakMw)
            / (float) $previousPeakMw * 100;

        return $dropPercent >= self::PEAK_DROP_ALERT_PERCENT;
    }

    public function create(array $data): PowerReading
    {
        return DB::transaction(function () use ($data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);
            $data['peak_drop_alert'] = $this->shouldFlagPeakDrop($data);

            return PowerReading::create($data);
        });
    }

    public function update(PowerReading $reading, array $data): PowerReading
    {
        return DB::transaction(function () use ($reading, $data) {
            $data = $this->sanitize($data);
            $this->checkConstraints($data);
            $data['peak_drop_alert'] = $this->shouldFlagPeakDrop($data, $reading);

            $reading->update($data);

            return $reading->refresh();
        });
    }

    public function delete(PowerReading $reading): void
    {
        DB::transaction(fn () => $reading->delete());
    }
}
