
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

    $monthlyMetrics = DB::table('power_readings')
        ->whereBetween('reading_timestamp', [$monthStart, $now])
        ->selectRaw('COALESCE(SUM(kwh_generated), 0) as generation_kwh')
        ->selectRaw('COALESCE(MAX(peak_mw), 0) as peak_output_mw')
        ->first();

    $dailyGeneration = DB::table('power_readings')
        ->whereBetween('reading_timestamp', [$trendStart, $now])
        ->selectRaw('DATE(reading_timestamp) as reading_day')
        ->selectRaw('SUM(kwh_generated) as generation_kwh')
        ->groupBy('reading_day')
        ->pluck('generation_kwh', 'reading_day');

    $generationTrend = collect(range(6, 0))->map(function (int $daysAgo) use ($now, $dailyGeneration) {
        $day = $now->copy()->startOfDay()->subDays($daysAgo);
        $date = $day->format('Y-m-d');

        return [
            'date' => $date,
            'label' => $day->format('D'),
            'generationKwh' => (float) ($dailyGeneration[$date] ?? 0),
        ];
    });

    return Inertia::render('dashboard', [
        'summary' => [
            'totalStations' => PowerStation::count(),
            'activeStations' => PowerStation::whereIn(DB::raw('LOWER(station_status)'), ['active', 'online', 'operational'])->count(),
            'maintenanceStations' => PowerStation::whereRaw('LOWER(station_status) = ?', ['maintenance'])->count(),
            'inactiveStations' => PowerStation::whereIn(DB::raw('LOWER(station_status)'), ['inactive', 'offline'])->count(),
            'installedCapacityMw' => (float) PowerStation::sum('installed_capacity_mw'),
            'generationThisMonthKwh' => (float) $monthlyMetrics->generation_kwh,
            'peakOutputThisMonthMw' => (float) $monthlyMetrics->peak_output_mw,
            'peakDropAlerts' => PowerReading::where('peak_drop_alert', true)->count(),
        ],
        'generationTrend' => $generationTrend,
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
