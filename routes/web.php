
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StationTypeController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\GridZoneController;
use App\Http\Controllers\PowerStationController;
use App\Http\Controllers\PowerReadingController;
use App\Models\PowerReading;
use App\Models\PowerStation;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Home Page
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Dashboard
Route::get('/dashboard', function () {
    $now = now();
    $monthStart = $now->copy()->startOfMonth();
    $trendStart = $now->copy()->startOfDay()->subDays(6);
    $yearTrendStart = $monthStart->copy()->subMonths(11);

    $monthlyMetrics = DB::table('power_readings')
        ->whereBetween('reading_timestamp', [$monthStart, $now])
        ->selectRaw('COALESCE(SUM(kwh_generated), 0) as generation_kwh')
        ->selectRaw('COALESCE(MAX(peak_mw), 0) as peak_output_mw')
        ->first();

    $readingMetrics = DB::table('power_readings')
        ->selectRaw('COUNT(*) as total_readings')
        ->selectRaw('COALESCE(SUM(kwh_generated), 0) as total_generation_kwh')
        ->selectRaw('COALESCE(MAX(peak_mw), 0) as peak_output_mw')
        ->selectRaw('COALESCE(SUM(ROUND(kwh_generated * feed_in_tariff_rate, 2)), 0) as gross_payout')
        ->first();

    $dailyGeneration = DB::table('power_readings')
        ->whereBetween('reading_timestamp', [$trendStart, $now])
        ->selectRaw('DATE(reading_timestamp) as reading_day')
        ->selectRaw('SUM(kwh_generated) as generation_kwh')
        ->groupBy('reading_day')
        ->pluck('generation_kwh', 'reading_day');

    $months = collect(range(11, 0))
        ->map(fn (int $monthsAgo) => $now->copy()->startOfMonth()->subMonths($monthsAgo));

    $monthlyGenerationQuery = DB::table('power_readings')
        ->whereBetween('reading_timestamp', [$yearTrendStart, $now]);

    foreach ($months as $index => $month) {
        $monthStart = $month->copy()->startOfMonth();
        $nextMonthStart = $monthStart->copy()->addMonth();

        $monthlyGenerationQuery->selectRaw(
            "COALESCE(SUM(CASE WHEN reading_timestamp >= ? AND reading_timestamp < ? THEN kwh_generated ELSE 0 END), 0) as month_{$index}",
            [$monthStart, $nextMonthStart]
        );
    }

    $monthlyGeneration = $monthlyGenerationQuery->first();

    $generationTrend = collect(range(6, 0))->map(function (int $daysAgo) use ($now, $dailyGeneration) {
        $day = $now->copy()->startOfDay()->subDays($daysAgo);
        $date = $day->format('Y-m-d');

        return [
            'date' => $date,
            'label' => $day->format('D'),
            'generationKwh' => (float) ($dailyGeneration[$date] ?? 0),
        ];
    });

    $monthlyGenerationTrend = $months->map(function ($month, int $index) use ($monthlyGeneration) {
        return [
            'date' => $month->format('Y-m'),
            'label' => $month->format('M'),
            'generationKwh' => (float) $monthlyGeneration->{'month_'.$index},
        ];
    });

    $generationByType = DB::table('power_readings')
        ->join('power_stations', 'power_readings.station_code', '=', 'power_stations.station_code')
        ->join('station_types', 'power_stations.station_type_id', '=', 'station_types.station_type_id')
        ->select('station_types.type_name as stationType')
        ->selectRaw('SUM(power_readings.kwh_generated) as generationKwh')
        ->groupBy('station_types.type_name')
        ->orderByDesc('generationKwh')
        ->get()
        ->map(fn ($row) => [
            'stationType' => $row->stationType,
            'generationKwh' => (float) $row->generationKwh,
        ]);

    $topStations = DB::table('power_readings')
        ->join('power_stations', 'power_readings.station_code', '=', 'power_stations.station_code')
        ->select('power_stations.station_code as stationCode')
        ->selectRaw('SUM(power_readings.kwh_generated) as generationKwh')
        ->groupBy('power_stations.station_code')
        ->orderByDesc('generationKwh')
        ->limit(5)
        ->get()
        ->map(fn ($row) => [
            'stationCode' => $row->stationCode,
            'generationKwh' => (float) $row->generationKwh,
        ]);

    return Inertia::render('dashboard', [
        'summary' => [
            'totalStations' => PowerStation::count(),
            'activeStations' => PowerStation::whereIn(DB::raw('LOWER(station_status)'), ['active', 'online', 'operational'])->count(),
            'maintenanceStations' => PowerStation::whereRaw('LOWER(station_status) = ?', ['maintenance'])->count(),
            'inactiveStations' => PowerStation::whereIn(DB::raw('LOWER(station_status)'), ['inactive', 'offline'])->count(),
            'installedCapacityMw' => (float) PowerStation::sum('installed_capacity_mw'),
            'totalReadings' => (int) $readingMetrics->total_readings,
            'totalGenerationKwh' => (float) $readingMetrics->total_generation_kwh,
            'totalPeakOutputMw' => (float) $readingMetrics->peak_output_mw,
            'totalGrossPayout' => (float) $readingMetrics->gross_payout,
            'generationThisMonthKwh' => (float) $monthlyMetrics->generation_kwh,
            'peakOutputThisMonthMw' => (float) $monthlyMetrics->peak_output_mw,
            'peakDropAlerts' => PowerReading::where('peak_drop_alert', true)->count(),
        ],
        'generationTrend' => $generationTrend,
        'monthlyGenerationTrend' => $monthlyGenerationTrend,
        'generationByType' => $generationByType,
        'topStations' => $topStations,
        'latestStations' => PowerStation::with(['stationType', 'operator', 'gridZone'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (PowerStation $station) => [
                'stationCode' => $station->station_code,
                'stationType' => $station->stationType?->type_name,
                'operator' => $station->operator?->operator_name,
                'gridZone' => $station->gridZone?->zone_name,
                'status' => $station->station_status,
                'createdAt' => $station->created_at?->format('Y-m-d'),
            ]),
        'recentReadings' => PowerReading::with('station')
            ->orderByDesc('reading_timestamp')
            ->limit(6)
            ->get()
            ->map(fn (PowerReading $reading) => [
                'readingId' => $reading->reading_id,
                'stationCode' => $reading->station?->station_code ?? $reading->station_code,
                'readingTimestamp' => $reading->reading_timestamp?->format('Y-m-d H:i'),
                'generationKwh' => $reading->kwh_generated,
                'peakMw' => $reading->peak_mw,
                'peakDropAlert' => $reading->peak_drop_alert,
            ]),
    ]);
})->middleware(['auth'])->name('dashboard');

/*
|--------------------------------------------------------------------------
| Station Type Routes
|--------------------------------------------------------------------------
*/

Route::resource('station-types', StationTypeController::class);

/*
|--------------------------------------------------------------------------
| Operator Routes
|--------------------------------------------------------------------------
*/

Route::resource('operators', OperatorController::class);

/*
|--------------------------------------------------------------------------
| Grid Zone Routes
|--------------------------------------------------------------------------
*/

Route::resource('grid-zones', GridZoneController::class);

/*
|--------------------------------------------------------------------------
| Power Station Routes
|--------------------------------------------------------------------------
*/

Route::resource('power-stations', PowerStationController::class);

/*
|--------------------------------------------------------------------------
| Power Reading Routes
|--------------------------------------------------------------------------
*/

Route::resource('power-readings', PowerReadingController::class);

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
