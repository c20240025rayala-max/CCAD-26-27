<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Operator;
use App\Http\Requests\OperatorRequest;
use App\Services\OperatorService;
use Inertia\Inertia;

class OperatorController extends Controller
{
    protected $operatorService;

    public function __construct(OperatorService $operatorService)
    {
        $this->operatorService = $operatorService;
    }

    // Display all operators
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
        ]);
        $search = trim($filters['search'] ?? '');
        $operators = Operator::withCount('powerStations')
            ->when($search !== '', fn ($query) => $query->where('operator_name', 'like', "%{$search}%"))
            ->orderBy('operator_name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('ReferenceData/index', [
            'resource' => 'operators',
            'records' => $operators->through(fn (Operator $operator) => [
                'id' => $operator->operator_id,
                'name' => $operator->operator_name,
                'stationCount' => $operator->power_stations_count,
            ]),
            'filters' => ['search' => $search],
        ]);
    }

    // Show the create form
    public function create()
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'operators',
        ]);
    }

    // Store a new operator
    public function store(OperatorRequest $request)
    {
        $this->operatorService->create($request->validated());

        return redirect()
            ->route('operators.index')
            ->with('success', 'Operator created successfully.');
    }

    // Display one operator
    public function show(Operator $operator)
    {
        return to_route('operators.edit', $operator);
    }

    // Show the edit form
    public function edit(Operator $operator)
    {
        return Inertia::render('ReferenceData/form', [
            'resource' => 'operators',
            'record' => [
                'id' => $operator->operator_id,
                'name' => $operator->operator_name,
            ],
        ]);
    }

    // Update an operator
    public function update(
        OperatorRequest $request,
        Operator $operator
    ) {
        $this->operatorService->update(
            $operator,
            $request->validated()
        );

        return redirect()
            ->route('operators.index')
            ->with('success', 'Operator updated successfully.');
    }

    // Delete an operator
    public function destroy(Operator $operator)
    {
        $operator->delete();

        return redirect()
            ->route('operators.index')
            ->with('success', 'Operator deleted successfully.');
    }
}
