<?php

namespace App\Http\Controllers;

use App\Models\PowerStation;
use App\Models\StationType;
use App\Models\Operator;
use App\Models\GridZone;
use App\Http\Requests\StorePowerStationRequest;
use App\Http\Requests\UpdatePowerStationRequest;
use App\Services\PowerStationService;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PowerStationController extends Controller
{
    protected $powerStationService;

    public function __construct(PowerStationService $powerStationService)
    {
        $this->powerStationService = $powerStationService;
    }

    // Display all power stations
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:active,inactive,maintenance'],
            'sort' => ['nullable', 'in:station_code,station_status,installed_capacity_mw'],
        ]);
        $search = trim($filters['search'] ?? '');
        $statusFilter = $filters['status'] ?? '';
        $sort = $filters['sort'] ?? 'station_code';
        $query = PowerStation::query()
            ->select([
                'station_code',
                'station_type_id',
                'operator_id',
                'grid_zone_id',
                'station_status',
                'installed_capacity_mw',
            ])
            ->with([
                'stationType:station_type_id,type_name',
                'operator:operator_id,operator_name',
                'gridZone:grid_zone_id,zone_name',
            ]);

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query->where('station_code', 'like', "%{$search}%")
                    ->orWhereHas('stationType', fn ($query) => $query->where('type_name', 'like', "%{$search}%"))
                    ->orWhereHas('operator', fn ($query) => $query->where('operator_name', 'like', "%{$search}%"))
                    ->orWhereHas('gridZone', fn ($query) => $query->where('zone_name', 'like', "%{$search}%"));
            });
        }

        if ($statusFilter === 'active') {
            $query->whereIn(DB::raw('LOWER(station_status)'), ['active', 'online', 'operational']);
        } elseif ($statusFilter === 'inactive') {
            $query->whereIn(DB::raw('LOWER(station_status)'), ['inactive', 'offline']);
        } elseif ($statusFilter === 'maintenance') {
            $query->whereRaw('LOWER(station_status) = ?', ['maintenance']);
        }

        $powerStations = $query
            ->when(
                $sort === 'station_status',
                fn ($query) => $query->orderByRaw('LOWER(station_status)'),
                fn ($query) => $query->orderBy($sort, $sort === 'installed_capacity_mw' ? 'desc' : 'asc')
            )
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('PowerStation/index', [
            'powerStations' => $powerStations,
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'sort' => $sort,
            ],
        ]);
    }

    // Show the create form
    public function create()
    {
        $stationTypes = StationType::query()
            ->orderBy('type_name')
            ->get(['station_type_id', 'type_name']);
        $operators = Operator::query()
            ->orderBy('operator_name')
            ->get(['operator_id', 'operator_name']);
        $gridZones = GridZone::query()
            ->orderBy('zone_name')
            ->get(['grid_zone_id', 'zone_name']);

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
        $stationTypes = StationType::query()
            ->orderBy('type_name')
            ->get(['station_type_id', 'type_name']);
        $operators = Operator::query()
            ->orderBy('operator_name')
            ->get(['operator_id', 'operator_name']);
        $gridZones = GridZone::query()
            ->orderBy('zone_name')
            ->get(['grid_zone_id', 'zone_name']);

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
