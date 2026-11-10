<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('power_stations', function (Blueprint $table) {
            $table->decimal('installed_capacity_mw', 12, 3)->nullable();
        });

        Schema::table('power_readings', function (Blueprint $table) {
            $table->boolean('peak_drop_alert')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('power_readings', function (Blueprint $table) {
            $table->dropColumn('peak_drop_alert');
        });

        Schema::table('power_stations', function (Blueprint $table) {
            $table->dropColumn('installed_capacity_mw');
        });
    }
};