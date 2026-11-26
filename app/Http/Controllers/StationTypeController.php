<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StationType;
use App\Http\Requests\StationTypeRequest;
use App\Services\StationTypeService;
use Inertia\Inertia;

class StationTypeController extends Controller
{
    protected $stationTypeService;

    public function __construct(StationTypeService $stationTypeService)
    {
        $this->stationTypeService = $stationTypeService;
    }

    // Display all station types
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($filters['search'] ?? '');
        $stationTypes = StationType::withCount('powerStations')
            ->when($search !== '', fn ($query) => $query->where('type_name', 'like', "%{$search}%"))
            ->orderBy('type_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ReferenceData/index', [
            'resource' => 'station-types',
            'records' => $stationTypes->through(fn (StationType $stationType) => [
                'id' => $stationType->station_type_id,
                'name' => $stationType->type_name,
                'stationCount' => $stationType->power_stations_count,
            ]),
            'filters' => ['search' => $search],
        ]);
    }

    // Show the create form
    public function create()
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'station-types',
        ]);
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
        return to_route('station-types.edit', $stationType);
    }

    // Show the edit form
    public function edit(StationType $stationType)
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'station-types',
            'record' => [
                'id' => $stationType->station_type_id,
                'name' => $stationType->type_name,
            ],
        ]);
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
