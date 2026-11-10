<?php

namespace Database\Seeders;

use App\Models\GridZone;
use App\Models\Operator;
use App\Models\StationType;
use Illuminate\Database\Seeder;

class PowerManagementSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Solar', 'Wind', 'Hydro', 'Thermal'] as $typeName) {
            StationType::firstOrCreate(['type_name' => $typeName]);
        }

        foreach (['Central Grid Operator', 'Regional Energy Operator'] as $operatorName) {
            Operator::firstOrCreate(['operator_name' => $operatorName]);
        }

        foreach (['North', 'Central', 'South'] as $zoneName) {
            GridZone::firstOrCreate(['zone_name' => $zoneName]);
        }
    }
}