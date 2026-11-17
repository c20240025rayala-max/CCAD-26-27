<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('power_readings', function (Blueprint $table) {
            $table->dropForeign(['station_code']);
            $table->foreign('station_code')
                ->references('station_code')
                ->on('power_stations')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('power_readings', function (Blueprint $table) {
            $table->dropForeign(['station_code']);
            $table->foreign('station_code')
                ->references('station_code')
                ->on('power_stations')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }
};
