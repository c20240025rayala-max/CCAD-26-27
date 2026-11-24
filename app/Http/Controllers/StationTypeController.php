<?php

namespace App\Http\Controllers;

use App\Models\StationType;
use App\Http\Requests\StationTypeRequest;
use App\Services\StationTypeService;

class StationTypeController extends Controller
{
    protected $stationTypeService;

    public function __construct(StationTypeService $stationTypeService)
    {
        $this->stationTypeService = $stationTypeService;
    }

    // Display all station types
    public function index()
    {
        $stationTypes = StationType::with('powerStations')
            ->orderBy('type_name')
            ->paginate(10);

        return view('station_types.index', compact('stationTypes'));
    }

    // Show the create form
    public function create()
    {
        return view('station_types.create');
    }

    // Store a new station type
    public function store(StationTypeRequest $request)
    {
        $this->stationTypeService->create($request->validated());

        return redirect()
            ->route('station-types.index')
            ->with('success', 'Station type created successfully.');
    }

    // Display one station type
    public function show(StationType $stationType)
    {
        $stationType->load('powerStations');

        return view('station_types.show', compact('stationType'));
    }

    // Show the edit form
    public function edit(StationType $stationType)
    {
        return view('station_types.edit', compact('stationType'));
    }

    // Update a station type
    public function update(
        StationTypeRequest $request,
        StationType $stationType
    ) {
        $this->stationTypeService->update(
            $stationType,
            $request->validated()
        );

        return redirect()
            ->route('station-types.index')
            ->with('success', 'Station type updated successfully.');
    }

    // Delete a station type
    public function destroy(StationType $stationType)
    {
        $stationType->delete();

        return redirect()
            ->route('station-types.index')
            ->with('success', 'Station type deleted successfully.');
    }
}
