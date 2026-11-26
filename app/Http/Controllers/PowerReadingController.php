<?php

namespace App\Http\Controllers;

use App\Models\PowerReading;
use App\Models\PowerStation;
use App\Http\Requests\StorePowerReadingRequest;
use App\Http\Requests\UpdatePowerReadingRequest;
use App\Services\PowerReadingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PowerReadingController extends Controller
{
    protected $powerReadingService;

    public function __construct(PowerReadingService $powerReadingService)
    {
        $this->powerReadingService = $powerReadingService;
    }

    // Display all power readings
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'from' => ['nullable', 'date'],
            'to' => array_values(array_filter([
                'nullable',
                'date',
                $request->filled('from') ? 'after_or_equal:from' : null,
            ])),
        ]);
        $search = trim($filters['search'] ?? '');
        $query = PowerReading::with('station:station_code');

        if ($search !== '') {
            $query->where(function ($query) use ($search) {
                $query->where('station_code', 'like', "%{$search}%");
                if (ctype_digit($search)) {
                    $query->orWhere('reading_id', (int) $search);
                }
            });
        }

        $query
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('reading_timestamp', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('reading_timestamp', '<=', $date));

        $powerReadings = $query
            ->orderByDesc('reading_timestamp')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('PowerReading/index', [
            'powerReadings' => $powerReadings,
            'filters' => [
                'search' => $search,
                'from' => $filters['from'] ?? '',
                'to' => $filters['to'] ?? '',
            ],
        ]);
    }

    // Show the create form
    public function create()
    {
        $powerStations = PowerStation::query()
            ->orderBy('station_code')
            ->get(['station_code', 'installed_capacity_mw']);

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
        $powerStations = PowerStation::query()
            ->orderBy('station_code')
            ->get(['station_code', 'installed_capacity_mw']);

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
