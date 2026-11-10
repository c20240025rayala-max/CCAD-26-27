<?php

namespace App\Http\Controllers;

use App\Models\Operator;
use App\Http\Requests\OperatorRequest;
use App\Services\OperatorService;

class OperatorController extends Controller
{
    protected $operatorService;

    public function __construct(OperatorService $operatorService)
    {
        $this->operatorService = $operatorService;
    }

    // Display all operators
    public function index()
    {
        $operators = Operator::with('powerStations')
            ->orderBy('operator_name')
            ->paginate(10);

        return view('operators.index', compact('operators'));
    }

    // Show the create form
    public function create()
    {
        return view('operators.create');
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
        $operator->load('powerStations');

        return view('operators.show', compact('operator'));
    }

    // Show the edit form
    public function edit(Operator $operator)
    {
        return view('operators.edit', compact('operator'));
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
