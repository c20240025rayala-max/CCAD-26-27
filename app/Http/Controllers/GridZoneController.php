<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GridZone;
use App\Http\Requests\GridZoneRequest;
use App\Services\GridZoneService;
use Inertia\Inertia;

class GridZoneController extends Controller
{
    protected $gridZoneService;

    public function __construct(GridZoneService $gridZoneService)
    {
        $this->gridZoneService = $gridZoneService;
    }

    // Display all grid zones
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($filters['search'] ?? '');
        $gridZones = GridZone::withCount('powerStations')
            ->when($search !== '', fn ($query) => $query->where('zone_name', 'like', "%{$search}%"))
            ->orderBy('zone_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ReferenceData/index', [
            'resource' => 'grid-zones',
            'records' => $gridZones->through(fn (GridZone $gridZone) => [
                'id' => $gridZone->grid_zone_id,
                'name' => $gridZone->zone_name,
                'stationCount' => $gridZone->power_stations_count,
            ]),
            'filters' => ['search' => $search],
        ]);
    }

    // Show the create form
    public function create()
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'grid-zones',
        ]);
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
        return to_route('grid-zones.edit', $gridZone);
    }

    // Show the edit form
    public function edit(GridZone $gridZone)
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'grid-zones',
            'record' => [
                'id' => $gridZone->grid_zone_id,
                'name' => $gridZone->zone_name,
            ],
        ]);
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
