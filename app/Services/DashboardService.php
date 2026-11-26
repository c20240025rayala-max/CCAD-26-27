<?php

namespace App\Services;

use App\Models\PowerReading;
use App\Models\PowerStation;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function dashboardData(string $period): array
    {
        $now = now();
        $yearStart = $now->copy()->startOfMonth()->subMonths(11);
        $periodStart = match ($period) {
            'month' => $now->copy()->startOfWeek()->subWeeks(11),
            'year' => $yearStart->copy(),
            default => $now->copy()->startOfDay()->subDays(6),
        };

        $dailyReadings = DB::table('power_readings')
            ->whereBetween('reading_timestamp', [$yearStart, $now])
            ->selectRaw('DATE(reading_timestamp) as reading_day')
            ->selectRaw('SUM(kwh_generated) as generation_kwh')
            ->selectRaw('SUM(ROUND(kwh_generated * feed_in_tariff_rate, 2)) as gross_payout')
            ->groupBy('reading_day')
            ->get();

        $allReadingMetrics = DB::table('power_readings')
            ->selectRaw('COUNT(*) as total_readings')
            ->selectRaw('COALESCE(SUM(kwh_generated), 0) as total_generation_kwh')
            ->selectRaw('COALESCE(MAX(peak_mw), 0) as peak_output_mw')
            ->selectRaw('COALESCE(SUM(ROUND(kwh_generated * feed_in_tariff_rate, 2)), 0) as gross_payout')
            ->first();

        $monthStart = $now->copy()->startOfMonth();
        $monthlyMetrics = DB::table('power_readings')
            ->whereBetween('reading_timestamp', [$monthStart, $now])
            ->selectRaw('COALESCE(SUM(kwh_generated), 0) as generation_kwh')
            ->selectRaw('COALESCE(MAX(peak_mw), 0) as peak_output_mw')
            ->first();

        $stationMetrics = DB::table('power_stations')
            ->selectRaw("COALESCE(SUM(CASE WHEN LOWER(station_status) IN ('active', 'online', 'operational') THEN 1 ELSE 0 END), 0) as active_stations")
            ->selectRaw("COALESCE(SUM(CASE WHEN LOWER(station_status) = 'maintenance' THEN 1 ELSE 0 END), 0) as maintenance_stations")
            ->selectRaw("COALESCE(SUM(CASE WHEN LOWER(station_status) IN ('inactive', 'offline') THEN 1 ELSE 0 END), 0) as inactive_stations")
            ->first();
        $totalStations = PowerStation::count();

        return [
            'summary' => [
                'totalStations' => $totalStations,
                'activeStations' => (int) $stationMetrics->active_stations,
                'maintenanceStations' => (int) $stationMetrics->maintenance_stations,
                'inactiveStations' => (int) $stationMetrics->inactive_stations,
                'installedCapacityMw' => (float) PowerStation::sum('installed_capacity_mw'),
                'totalReadings' => (int) $allReadingMetrics->total_readings,
                'totalGenerationKwh' => (float) $allReadingMetrics->total_generation_kwh,
                'totalPeakOutputMw' => (float) $allReadingMetrics->peak_output_mw,
                'totalGrossPayout' => (string) $allReadingMetrics->gross_payout,
                'generationThisMonthKwh' => (float) $monthlyMetrics->generation_kwh,
                'peakOutputThisMonthMw' => (float) $monthlyMetrics->peak_output_mw,
            ],
            'generationTrend' => $this->generationTrend($period, $now, $dailyReadings),
            'monthlyGenerationTrend' => $this->monthlyGenerationTrend($now, $dailyReadings),
            'payoutTrend' => $this->payoutTrend($now, $dailyReadings),
            'stationGeneration' => DB::table('power_readings')
                ->join('power_stations', 'power_readings.station_code', '=', 'power_stations.station_code')
                ->whereBetween('reading_timestamp', [$periodStart, $now])
                ->select('power_stations.station_code as stationCode')
                ->selectRaw('SUM(kwh_generated) as generationKwh')
                ->groupBy('power_stations.station_code')
                ->orderByDesc('generationKwh')
                ->limit(8)
                ->get()
                ->map(fn ($row) => [
                    'stationCode' => $row->stationCode,
                    'generationKwh' => (float) $row->generationKwh,
                ]),
            'generationByType' => DB::table('power_readings')
                ->join('power_stations', 'power_readings.station_code', '=', 'power_stations.station_code')
                ->join('station_types', 'power_stations.station_type_id', '=', 'station_types.station_type_id')
                ->whereBetween('power_readings.reading_timestamp', [$periodStart, $now])
                ->select('station_types.type_name as stationType')
                ->selectRaw('SUM(power_readings.kwh_generated) as generationKwh')
                ->groupBy('station_types.type_name')
                ->orderByDesc('generationKwh')
                ->get()
                ->map(fn ($row) => [
                    'stationType' => $row->stationType,
                    'generationKwh' => (float) $row->generationKwh,
                ]),
            'stationStatus' => [
                ['label' => 'Active', 'count' => (int) $stationMetrics->active_stations],
                ['label' => 'Inactive', 'count' => (int) $stationMetrics->inactive_stations],
                ['label' => 'Maintenance', 'count' => (int) $stationMetrics->maintenance_stations],
                ['label' => 'Other', 'count' => max(
                    0,
                    $totalStations -
                        (int) $stationMetrics->active_stations -
                        (int) $stationMetrics->inactive_stations -
                        (int) $stationMetrics->maintenance_stations
                )],
            ],
            'latestStations' => PowerStation::with(['stationType', 'operator', 'gridZone'])
                ->withCount('readings')
                ->latest()
                ->limit(8)
                ->get()
                ->map(fn (PowerStation $station) => [
                    'stationCode' => $station->station_code,
                    'stationType' => $station->stationType?->type_name,
                    'operator' => $station->operator?->operator_name,
                    'gridZone' => $station->gridZone?->zone_name,
                    'status' => $station->station_status,
                    'installedCapacityMw' => $station->installed_capacity_mw,
                    'readingCount' => $station->readings_count,
                    'createdAt' => $station->created_at?->format('Y-m-d'),
                ]),
            'recentReadings' => PowerReading::with('station:station_code')
                ->select('power_readings.*')
                ->selectRaw('ROUND(kwh_generated * feed_in_tariff_rate, 2) as calculated_gross_payout')
                ->orderByDesc('reading_timestamp')
                ->limit(8)
                ->get()
                ->map(fn (PowerReading $reading) => [
                    'readingId' => $reading->reading_id,
                    'stationCode' => $reading->station?->station_code ?? $reading->station_code,
                    'readingTimestamp' => $reading->reading_timestamp?->format('Y-m-d H:i'),
                    'generationKwh' => $reading->kwh_generated,
                    'peakMw' => $reading->peak_mw,
                    'tariffRate' => $reading->feed_in_tariff_rate,
                    'grossPayout' => (string) $reading->calculated_gross_payout,
                ]),
            'periodStart' => $periodStart->toDateString(),
            'periodEnd' => $now->toDateString(),
        ];
    }

    private function generationTrend(string $period, CarbonInterface $now, Collection $dailyReadings): array
    {
        $buckets = $this->buckets($period, $now);
        $totals = $dailyReadings
            ->groupBy(function ($row) use ($period) {
                $day = Carbon::parse($row->reading_day);

                return match ($period) {
                    'month' => $day->copy()->startOfWeek()->toDateString(),
                    'year' => $day->format('Y-m'),
                    default => $day->toDateString(),
                };
            })
            ->map(fn (Collection $rows) => (float) $rows->sum('generation_kwh'));

        return $buckets->map(fn (array $bucket) => [
            'date' => $bucket['date'],
            'label' => $bucket['label'],
            'generationKwh' => $totals->get($bucket['key'], 0.0),
        ])->all();
    }

    private function payoutTrend(CarbonInterface $now, Collection $dailyReadings): array
    {
        $totals = $dailyReadings
            ->groupBy(fn ($row) => Carbon::parse($row->reading_day)->format('Y-m'))
            ->map(fn (Collection $rows) => (float) $rows->sum('gross_payout'));

        return collect(range(11, 0))
            ->map(function (int $monthsAgo) use ($now, $totals) {
                $month = Carbon::parse($now)->startOfMonth()->subMonths($monthsAgo);
                $key = $month->format('Y-m');

                return [
                    'date' => $key,
                    'label' => $month->format('M'),
                    'grossPayout' => $totals->get($key, 0.0),
                ];
            })
            ->all();
    }

    private function monthlyGenerationTrend(CarbonInterface $now, Collection $dailyReadings): array
    {
        $totals = $dailyReadings
            ->groupBy(fn ($row) => Carbon::parse($row->reading_day)->format('Y-m'))
            ->map(fn (Collection $rows) => (float) $rows->sum('generation_kwh'));

        return collect(range(11, 0))
            ->map(function (int $monthsAgo) use ($now, $totals) {
                $month = Carbon::parse($now)->startOfMonth()->subMonths($monthsAgo);
                $key = $month->format('Y-m');

                return [
                    'date' => $key,
                    'label' => $month->format('M'),
                    'generationKwh' => $totals->get($key, 0.0),
                ];
            })
            ->all();
    }

    private function buckets(string $period, CarbonInterface $now): Collection
    {
        return match ($period) {
            'month' => collect(range(11, 0))->map(function (int $weeksAgo) use ($now) {
                $week = Carbon::parse($now)->startOfWeek()->subWeeks($weeksAgo);

                return [
                    'key' => $week->toDateString(),
                    'date' => $week->toDateString(),
                    'label' => $week->format('M j'),
                ];
            }),
            'year' => collect(range(11, 0))->map(function (int $monthsAgo) use ($now) {
                $month = Carbon::parse($now)->startOfMonth()->subMonths($monthsAgo);

                return [
                    'key' => $month->format('Y-m'),
                    'date' => $month->format('Y-m'),
                    'label' => $month->format('M'),
                ];
            }),
            default => collect(range(6, 0))->map(function (int $daysAgo) use ($now) {
                $day = Carbon::parse($now)->startOfDay()->subDays($daysAgo);

                return [
                    'key' => $day->toDateString(),
                    'date' => $day->toDateString(),
                    'label' => $day->format('D'),
                ];
            }),
        };
    }
}
