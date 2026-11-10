<?php

namespace App\Http\Controllers;

use App\Models\PowerReading;
use App\Models\PowerStation;
use App\Http\Requests\StorePowerReadingRequest;
use App\Http\Requests\UpdatePowerReadingRequest;
use App\Services\PowerReadingService;
use Inertia\Inertia;

class PowerReadingController extends Controller
{
    protected $powerReadingService;

    public function __construct(PowerReadingService $powerReadingService)
    {
        $this->powerReadingService = $powerReadingService;
    }

    // Display all power readings
    public function index()
    {
        $powerReadings = PowerReading::with('station')
            ->orderByDesc('reading_timestamp')
            ->paginate(10);

        return Inertia::render('PowerReading/index', [
            'powerReadings' => $powerReadings,
        ]);
    }

    // Show the create form
    public function create()
    {
        $powerStations = PowerStation::orderBy('station_code')->get();

        return Inertia::render('PowerReading/create', [
            'powerStations' => $powerStations,
        ]);
    }

    // Store a new power reading
    public function store(StorePowerReadingRequest $request)
    {
        $this->powerReadingService->create($request->validated());

        return redirect()
            ->route('power-readings.index')
            ->with('success', 'Power reading created successfully.');
    }

    // Display one power reading
    public function show(PowerReading $powerReading)
    {
        return to_route('power-readings.edit', $powerReading);
    }

    // Show the edit form
    public function edit(PowerReading $powerReading)
    {
        $powerStations = PowerStation::orderBy('station_code')->get();

        return Inertia::render('PowerReading/create', [
            'powerReading' => $powerReading,
            'powerStations' => $powerStations,
        ]);
    }

    // Update a power reading
    public function update(
        UpdatePowerReadingRequest $request,
        int $id
    ) {
        $powerReading = PowerReading::findOrFail($id);

        $this->powerReadingService->update(
            $powerReading,
            $request->validated()
        );

        return redirect()
            ->route('power-readings.index')
            ->with('success', 'Power reading updated successfully.');
    }

    // Delete a power reading
    public function destroy(PowerReading $powerReading)
    {
        $this->powerReadingService->delete($powerReading);

        return redirect()
            ->route('power-readings.index')
            ->with('success', 'Power reading deleted successfully.');
    }
}
