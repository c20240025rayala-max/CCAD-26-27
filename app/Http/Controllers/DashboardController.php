<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $dashboardService): Response
    {
        $requestedPeriod = $request->query('period', 'week');
        $period = in_array($requestedPeriod, ['week', 'month', 'year'], true)
            ? $requestedPeriod
            : 'week';

        return Inertia::render('dashboard', [
            ...$dashboardService->dashboardData($period),
            'period' => $period,
        ]);
    }
}
