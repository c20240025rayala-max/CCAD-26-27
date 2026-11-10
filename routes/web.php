
<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StationTypeController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\GridZoneController;
use App\Http\Controllers\PowerStationController;
use App\Http\Controllers\PowerReadingController;
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
    return Inertia::render('dashboard');
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
