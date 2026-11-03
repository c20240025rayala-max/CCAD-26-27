<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('power_stations', function (Blueprint $table) {
            
            $table->string('station_code', 100)->primary();

            $table->foreignId('station_type_id')
            ->constrained('station_types', 'station_type_id')
            ->restrictOnDelete();

            $table->foreignId('operator_id')
            ->constrained('operators', 'operator_id')
            ->restrictOnDelete();

            $table->foreignId('grid_zone_id')
            ->constrained('grid_zones', 'grid_zone_id')
            ->restrictOnDelete();

            $table->string('station_status', 50);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('power_stations');
    }
};
