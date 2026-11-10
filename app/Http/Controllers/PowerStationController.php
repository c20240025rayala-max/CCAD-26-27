<?php

namespace App\Http\Controllers;

use App\Models\PowerStation;
use App\Models\StationType;
use App\Models\Operator;
use App\Models\GridZone;
use App\Http\Requests\StorePowerStationRequest;
use App\Http\Requests\UpdatePowerStationRequest;
use App\Services\PowerStationService;
use Inertia\Inertia;

class PowerStationController extends Controller
{
    protected $powerStationService;

    public function __construct(PowerStationService $powerStationService)
    {
        $this->powerStationService = $powerStationService;
    }

    // Display all power stations
    public function index()
    {
        $powerStations = PowerStation::with([
            'stationType',
            'operator',
            'gridZone',
            'readings',
        ])
            ->orderBy('station_code')
            ->paginate(10);

        return Inertia::render('PowerStation/index', [
            'powerStations' => $powerStations,
        ]);
    }

    // Show the create form
    public function create()
    {
        $stationTypes = StationType::orderBy('type_name')->get();
        $operators = Operator::orderBy('operator_name')->get();
        $gridZones = GridZone::orderBy('zone_name')->get();

        return Inertia::render('PowerStation/create', [
            'stationTypes' => $stationTypes,
            'operators' => $operators,
            'gridZones' => $gridZones,
        ]);
    }

    // Store a new power station
    public function store(StorePowerStationRequest $request)
    {
        $this->powerStationService->create($request->validated());

        return redirect()
            ->route('power-stations.index')
            ->with('success', 'Power station created successfully.');
    }

    // Display one power station
    public function show(PowerStation $powerStation)
    {
        return to_route('power-stations.edit', $powerStation);
    }

    // Show the edit form
    public function edit(PowerStation $powerStation)
    {
        $stationTypes = StationType::orderBy('type_name')->get();
        $operators = Operator::orderBy('operator_name')->get();
        $gridZones = GridZone::orderBy('zone_name')->get();

        return Inertia::render('PowerStation/create', [
            'powerStation' => $powerStation,
            'stationTypes' => $stationTypes,
            'operators' => $operators,
            'gridZones' => $gridZones,
        ]);
    }

    // Update a power station
    public function update(
        UpdatePowerStationRequest $request,
        string $id
    ) {
        $powerStation = PowerStation::findOrFail($id);

        $this->powerStationService->update(
            $powerStation,
            $request->validated()
        );

        return redirect()
            ->route('power-stations.index')
            ->with('success', 'Power station updated successfully.');
    }

    // Delete a power station
    public function destroy(PowerStation $powerStation)
    {
        $this->powerStationService->delete($powerStation);

        return redirect()
            ->route('power-stations.index')
            ->with('success', 'Power station deleted successfully.');
    }
}
