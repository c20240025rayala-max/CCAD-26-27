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
        Schema::create('power_readings', function (Blueprint $table) {
            $table->id('reading_id');
            $table->string('station_code', 100);

            $table->foreign('station_code')
            ->references('station_code')
            ->on('power_stations')
            ->cascadeOnUpdate()
            ->restrictOnDelete();

            $table->decimal('kwh_generated', 14, 3 );
            $table->decimal('peak_mw', 12, 3 );
            $table->dateTime('reading_timestamp');
            $table->decimal( 'feed_in_tariff_rate', 12, 4 );
            $table->timestamps();

            $table->index([
                'station_code',
                'reading_timestamp'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('power_readings');
    }
};
