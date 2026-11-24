<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            'station_type_id' => 'power_stations_station_type_id_index',
            'operator_id' => 'power_stations_operator_id_index',
            'grid_zone_id' => 'power_stations_grid_zone_id_index',
        ] as $column => $indexName) {
            if (! Schema::hasIndex('power_stations', [$column])) {
                Schema::table('power_stations', function (Blueprint $table) use ($column, $indexName) {
                    $table->index($column, $indexName);
                });
            }
        }
    }

    public function down(): void
    {
        foreach ([
            'power_stations_station_type_id_index',
            'power_stations_operator_id_index',
            'power_stations_grid_zone_id_index',
        ] as $indexName) {
            if (Schema::hasIndex('power_stations', $indexName)) {
                Schema::table('power_stations', function (Blueprint $table) use ($indexName) {
                    $table->dropIndex($indexName);
                });
            }
        }
    }
};
