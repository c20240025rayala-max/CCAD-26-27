<?php

namespace Tests\Feature;

use App\Models\GridZone;
use App\Models\Operator;
use App\Models\PowerReading;
use App\Models\PowerStation;
use App\Models\StationType;
use App\Models\User;
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

    public function test_dashboard_displays_power_station_and_reading_metrics(): void
    {
        $station = $this->createPowerStation();
        PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '12.345',
            'peak_mw' => '2.500',
            'reading_timestamp' => now()->startOfDay(),
            'feed_in_tariff_rate' => '0.1250',
            'peak_drop_alert' => true,
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('summary.totalStations', 1)
                ->where('summary.activeStations', 1)
                ->where('summary.generationThisMonthKwh', 12.345)
                ->where('summary.peakOutputThisMonthMw', 2.5)
                ->where('summary.peakDropAlerts', 1)
                ->has('generationTrend', 7)
                ->where('recentReadings.0.stationCode', $station->station_code)
                ->where('recentReadings.0.peakDropAlert', true)
            );
    }

    public function test_power_station_code_is_generated_immutable_and_status_is_validated(): void
    {
        $type = StationType::create(['type_name' => 'Solar']);
        $operator = Operator::create(['operator_name' => 'North Energy']);
        $zone = GridZone::create(['zone_name' => 'North']);
        $data = [
            'station_code' => ' st-01 ',
            'station_type_id' => $type->station_type_id,
            'operator_id' => $operator->operator_id,
            'grid_zone_id' => $zone->grid_zone_id,
            'station_status' => 'Unknown',
            'installed_capacity_mw' => '3.500',
        ];

        $this->post(route('power-stations.store'), $data)
            ->assertSessionHasErrors('station_status');

        $data['station_status'] = 'Active';
        $this->post(route('power-stations.store'), $data)
            ->assertRedirect(route('power-stations.index'));

        $station = PowerStation::firstOrFail();
        $this->assertMatchesRegularExpression('/^PS-[0-9A-HJKMNP-TV-Z]{26}$/', $station->station_code);
        $this->assertDatabaseHas('power_stations', [
            'station_code' => $station->station_code,
            'station_status' => 'Active',
            'installed_capacity_mw' => '3.500',
        ]);

        $data['station_code'] = 'CHANGED';
        $data['station_status'] = 'Maintenance';
        $this->put(route('power-stations.update', $station->station_code), $data)
            ->assertRedirect(route('power-stations.index'));

        $this->assertDatabaseHas('power_stations', [
            'station_code' => $station->station_code,
            'station_status' => 'Maintenance',
        ]);

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
            'reading_timestamp' => now()->addYear()->format('Y-m-d\TH:i'),
            'feed_in_tariff_rate' => '0.1250',
        ];

        $this->post(route('power-readings.store'), $data)
            ->assertSessionHasErrors('reading_timestamp');

        $data['reading_timestamp'] = now()->subDays(7)->format('Y-m-d\TH:i');
        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $reading = PowerReading::firstOrFail();
        $this->assertSame('1.54', $reading->gross_payout);

        $data['kwh_generated'] = '20.000';
        $data['reading_timestamp'] = now()->addYear()->format('Y-m-d\TH:i');
        $this->put(route('power-readings.update', $reading->reading_id), $data)
            ->assertSessionHasErrors('reading_timestamp');

        $data['reading_timestamp'] = now()->subDays(6)->format('Y-m-d\TH:i');
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
            'reading_timestamp' => now()->startOfYear()->addDay()->setTime(12, 0)->format('Y-m-d\TH:i'),
            'feed_in_tariff_rate' => '0.1000',
        ];

        $this->post(route('power-readings.store'), $data)
            ->assertSessionHasErrors('peak_mw');

        $data['peak_mw'] = '2.500';
        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $data['peak_mw'] = '1.900';
        $data['reading_timestamp'] = now()->startOfYear()->addDay()->setTime(13, 0)->format('Y-m-d\TH:i');
        $this->post(route('power-readings.store'), $data)
            ->assertRedirect(route('power-readings.index'));

        $this->assertDatabaseHas('power_readings', [
            'station_code' => $station->station_code,
            'peak_mw' => '1.900',
            'peak_drop_alert' => true,
        ]);
    }

    public function test_deleting_a_power_station_also_deletes_its_readings(): void
    {
        $station = $this->createPowerStation();
        $reading = PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '12.345',
            'peak_mw' => '2.500',
            'reading_timestamp' => '2026-11-10 12:30:00',
            'feed_in_tariff_rate' => '0.1250',
        ]);

        $this->delete(route('power-stations.destroy', $station->station_code))
            ->assertRedirect(route('power-stations.index'));

        $this->assertDatabaseMissing('power_stations', [
            'station_code' => $station->station_code,
        ]);
        $this->assertDatabaseMissing('power_readings', [
            'reading_id' => $reading->reading_id,
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