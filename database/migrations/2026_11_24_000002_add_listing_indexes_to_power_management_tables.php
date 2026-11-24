<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            ['operators', 'operator_name', 'operators_operator_name_index'],
            ['power_readings', 'reading_timestamp', 'power_readings_reading_timestamp_index'],
        ] as [$tableName, $column, $indexName]) {
            if (! Schema::hasIndex($tableName, [$column])) {
                Schema::table($tableName, function (Blueprint $table) use ($column, $indexName) {
                    $table->index($column, $indexName);
                });
            }
        }
    }

    public function down(): void
    {
        foreach ([
            ['operators', 'operators_operator_name_index'],
            ['power_readings', 'power_readings_reading_timestamp_index'],
        ] as [$tableName, $indexName]) {
            if (Schema::hasIndex($tableName, $indexName)) {
                Schema::table($tableName, function (Blueprint $table) use ($indexName) {
                    $table->dropIndex($indexName);
                });
            }
        }
    }
};
