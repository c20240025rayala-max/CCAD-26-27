<?php

namespace Tests\Feature;

use App\Models\GridZone;
use App\Models\Operator;
use App\Models\PowerReading;
use App\Models\PowerStation;
use App\Models\StationType;
use Database\Seeders\PowerManagementSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PowerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_power_station_create_page_receives_reference_options(): void
    {
        $this->seed(PowerManagementSeeder::class);

        $this->withoutVite()
            ->get(route('power-stations.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerStation/create')
                ->has('stationTypes', 4)
                ->has('operators', 2)
                ->has('gridZones', 3)
            );
    }

    public function test_power_station_is_created_sanitized_updated_and_eager_loaded(): void
    {
        $type = StationType::create(['type_name' => 'Solar']);
        $operator = Operator::create(['operator_name' => 'North Energy']);
        $zone = GridZone::create(['zone_name' => 'North']);
        $data = [
            'station_code' => ' st-01 ',
            'station_type_id' => $type->station_type_id,
            'operator_id' => $operator->operator_id,
            'grid_zone_id' => $zone->grid_zone_id,
            'station_status' => '<strong>Online</strong>',
            'installed_capacity_mw' => '3.500',
        ];

        $this->post(route('power-stations.store'), $data)
            ->assertRedirect(route('power-stations.index'));

        $this->assertDatabaseHas('power_stations', [
            'station_code' => 'ST-01',
            'station_status' => 'Online',
            'installed_capacity_mw' => '3.500',
        ]);

        $data['station_code'] = 'ST-01';
        $data['station_status'] = 'Operational';
        $this->put(route('power-stations.update', 'ST-01'), $data)
            ->assertRedirect(route('power-stations.index'));

        $this->withoutVite()
            ->get(route('power-stations.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerStation/index')
                ->has('powerStations.data', 1)
                ->where('powerStations.data.0.station_type.type_name', 'Solar')
                ->where('powerStations.data.0.operator.operator_name', 'North Energy')
                ->where('powerStations.data.0.grid_zone.zone_name', 'North')
            );
    }

    public function test_power_readings_use_the_service_and_include_station_and_payout(): void
    {
        $station = $this->createPowerStation();
        $data = [
            'station_code' => strtolower($station->station_code),
            'kwh_generated' => '12.345',
            'peak_mw' => '2.500',
            'reading_timestamp' => '2026-11-10T12:30',
            'feed_in_tariff_rate' => '0.1250',
        ];

        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $reading = PowerReading::firstOrFail();
        $this->assertSame('1.54', $reading->gross_payout);

        $data['kwh_generated'] = '20.000';
        $this->put(route('power-readings.update', $reading->reading_id), $data)
            ->assertRedirect(route('power-readings.index'));

        $this->withoutVite()
            ->get(route('power-readings.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerReading/index')
                ->has('powerReadings.data', 1)
                ->where('powerReadings.data.0.station.station_code', $station->station_code)
                ->where('powerReadings.data.0.kwh_generated', '20.000')
                ->where('powerReadings.data.0.gross_payout', '2.50')
            );
    }

    public function test_reading_peak_is_limited_by_station_capacity_and_drops_are_flagged(): void
    {
        $station = $this->createPowerStation();
        $data = [
            'station_code' => $station->station_code,
            'kwh_generated' => '2500.000',
            'peak_mw' => '3.501',
            'reading_timestamp' => '2026-11-10T12:00',
            'feed_in_tariff_rate' => '0.1000',
        ];

        $this->post(route('power-readings.store'), $data)
            ->assertSessionHasErrors('peak_mw');

        $data['peak_mw'] = '2.500';
        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $data['peak_mw'] = '1.900';
        $data['reading_timestamp'] = '2026-11-10T13:00';
        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $this->assertDatabaseHas('power_readings', [
            'station_code' => $station->station_code,
            'peak_mw' => '1.900',
            'peak_drop_alert' => true,
        ]);
    }

    private function createPowerStation(): PowerStation
    {
        $type = StationType::create(['type_name' => 'Wind']);
        $operator = Operator::create(['operator_name' => 'West Energy']);
        $zone = GridZone::create(['zone_name' => 'West']);

        return PowerStation::create([
            'station_code' => 'ST-WEST',
            'station_type_id' => $type->station_type_id,
            'operator_id' => $operator->operator_id,
            'grid_zone_id' => $zone->grid_zone_id,
            'station_status' => 'Online',
            'installed_capacity_mw' => '3.500',
        ]);
    }
}