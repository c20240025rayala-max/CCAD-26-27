<?php

namespace App\Http\Controllers;

use App\Models\GridZone;
use App\Http\Requests\GridZoneRequest;
use App\Services\GridZoneService;

class GridZoneController extends Controller
{
    protected $gridZoneService;

    public function __construct(GridZoneService $gridZoneService)
    {
        $this->gridZoneService = $gridZoneService;
    }

    // Display all grid zones
    public function index()
    {
        $gridZones = GridZone::with('powerStations')
            ->orderBy('zone_name')
            ->paginate(10);

        return view('grid_zones.index', compact('gridZones'));
    }

    // Show the create form
    public function create()
    {
        return view('grid_zones.create');
    }

    // Store a new grid zone
    public function store(GridZoneRequest $request)
    {
        $this->gridZoneService->create($request->validated());

        return redirect()
            ->route('grid-zones.index')
            ->with('success', 'Grid zone created successfully.');
    }

    // Display one grid zone
    public function show(GridZone $gridZone)
    {
        $gridZone->load('powerStations');

        return view('grid_zones.show', compact('gridZone'));
    }

    // Show the edit form
    public function edit(GridZone $gridZone)
    {
        return view('grid_zones.edit', compact('gridZone'));
    }

    // Update a grid zone
    public function update(
        GridZoneRequest $request,
        GridZone $gridZone
    ) {
        $this->gridZoneService->update(
            $gridZone,
            $request->validated()
        );

        return redirect()
            ->route('grid-zones.index')
            ->with('success', 'Grid zone updated successfully.');
    }

    // Delete a grid zone
    public function destroy(GridZone $gridZone)
    {
        $gridZone->delete();

        return redirect()
            ->route('grid-zones.index')
            ->with('success', 'Grid zone deleted successfully.');
    }
}
