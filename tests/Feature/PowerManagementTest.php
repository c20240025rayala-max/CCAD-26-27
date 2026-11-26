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
                ->has('stationTypes.0.station_type_id')
                ->has('stationTypes.0.type_name')
                ->has('operators', 2)
                ->has('operators.0.operator_id')
                ->has('operators.0.operator_name')
                ->has('gridZones', 3)
                ->has('gridZones.0.grid_zone_id')
                ->has('gridZones.0.zone_name')
            );
    }

    public function test_grid_zone_request_sanitizes_and_validates_zone_name(): void
    {
        $this->post(route('grid-zones.store'), ['zone_name' => '<b> </b>'])
            ->assertSessionHasErrors([
                'zone_name' => 'Grid zone name cannot be empty.',
            ]);

        $this->post(route('grid-zones.store'), ['zone_name' => str_repeat('a', 101)])
            ->assertSessionHasErrors([
                'zone_name' => 'Grid zone name must not exceed 100 characters.',
            ]);

        $this->post(route('grid-zones.store'), ['zone_name' => '<b> North </b>'])
            ->assertRedirect(route('grid-zones.index'));

        $this->assertDatabaseHas('grid_zones', ['zone_name' => 'North']);
    }

    public function test_reference_data_pages_support_create_edit_and_delete_flows(): void
    {
        $resources = [
            [
                'slug' => 'station-types',
                'index' => 'station-types.index',
                'create' => 'station-types.create',
                'store' => 'station-types.store',
                'edit' => 'station-types.edit',
                'update' => 'station-types.update',
                'destroy' => 'station-types.destroy',
                'field' => 'type_name',
                'initial' => 'Solar',
                'updated' => 'Solar PV',
                'model' => StationType::class,
            ],
            [
                'slug' => 'operators',
                'index' => 'operators.index',
                'create' => 'operators.create',
                'store' => 'operators.store',
                'edit' => 'operators.edit',
                'update' => 'operators.update',
                'destroy' => 'operators.destroy',
                'field' => 'operator_name',
                'initial' => 'North Power',
                'updated' => 'North Power Group',
                'model' => Operator::class,
            ],
            [
                'slug' => 'grid-zones',
                'index' => 'grid-zones.index',
                'create' => 'grid-zones.create',
                'store' => 'grid-zones.store',
                'edit' => 'grid-zones.edit',
                'update' => 'grid-zones.update',
                'destroy' => 'grid-zones.destroy',
                'field' => 'zone_name',
                'initial' => 'North',
                'updated' => 'North Grid',
                'model' => GridZone::class,
            ],
        ];

        foreach ($resources as $resource) {
            $this->withoutVite()
                ->get(route($resource['index']))
                ->assertInertia(fn (Assert $page) => $page
                    ->component('ReferenceData/index')
                    ->where('resource', $resource['slug'])
                    ->where('records.total', 0)
                );

            $this->withoutVite()
                ->get(route($resource['create']))
                ->assertInertia(fn (Assert $page) => $page
                    ->component('ReferenceData/form')
                    ->where('resource', $resource['slug'])
                );

            $this->post(route($resource['store']), [$resource['field'] => $resource['initial']])
                ->assertRedirect(route($resource['index']));

            $record = $resource['model']::firstOrFail();
            $this->withoutVite()
                ->get(route($resource['edit'], $record->getKey()))
                ->assertInertia(fn (Assert $page) => $page
                    ->component('ReferenceData/form')
                    ->where('resource', $resource['slug'])
                    ->where('record.name', $resource['initial'])
                );

            $this->put(route($resource['update'], $record->getKey()), [$resource['field'] => $resource['updated']])
                ->assertRedirect(route($resource['index']));
            $this->assertDatabaseHas($record->getTable(), [$resource['field'] => $resource['updated']]);

            $this->delete(route($resource['destroy'], $record->getKey()))
                ->assertRedirect(route($resource['index']));
            $this->assertDatabaseMissing($record->getTable(), [$resource['field'] => $resource['updated']]);
        }
    }

    public function test_reference_data_indexes_support_search(): void
    {
        StationType::create(['type_name' => 'Solar PV']);
        StationType::create(['type_name' => 'Wind']);
        Operator::create(['operator_name' => 'North Energy']);
        Operator::create(['operator_name' => 'South Energy']);
        GridZone::create(['zone_name' => 'North Grid']);
        GridZone::create(['zone_name' => 'South Grid']);

        $this->get(route('station-types.index', ['search' => 'Solar']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'Solar')
                ->where('records.total', 1)
                ->where('records.data.0.name', 'Solar PV')
            );

        $this->get(route('operators.index', ['search' => 'North']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'North')
                ->where('records.total', 1)
                ->where('records.data.0.name', 'North Energy')
            );

        $this->get(route('grid-zones.index', ['search' => 'North']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'North')
                ->where('records.total', 1)
                ->where('records.data.0.name', 'North Grid')
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
                ->where('summary.totalReadings', 1)
                ->where('summary.totalGenerationKwh', 12.345)
                ->where('summary.totalPeakOutputMw', 2.5)
                ->where('summary.totalGrossPayout', '1.54')
                ->where('summary.generationThisMonthKwh', 12.345)
                ->where('summary.peakOutputThisMonthMw', 2.5)
                ->has('generationTrend', 7)
                ->has('monthlyGenerationTrend', 12)
                ->has('stationStatus', 4)
                ->has('payoutTrend', 12)
                ->where('generationByType.0.stationType', 'Wind')
                ->where('generationByType.0.generationKwh', 12.345)
                ->where('stationGeneration.0.stationCode', $station->station_code)
                ->where('latestStations.0.stationCode', $station->station_code)
                ->where('recentReadings.0.stationCode', $station->station_code)
                ->where('recentReadings.0.grossPayout', '1.54')
            );
    }

    public function test_dashboard_supports_week_month_and_year_generation_periods(): void
    {
        $station = $this->createPowerStation();
        PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '3.000',
            'peak_mw' => '1.000',
            'reading_timestamp' => now()->startOfWeek()->subWeeks(11)->addHour(),
            'feed_in_tariff_rate' => '0.1000',
            'peak_drop_alert' => false,
        ]);
        PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '7.000',
            'peak_mw' => '2.000',
            'reading_timestamp' => now()->startOfDay(),
            'feed_in_tariff_rate' => '0.1000',
            'peak_drop_alert' => false,
        ]);

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard', ['period' => 'week']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('period', 'week')
                ->has('generationTrend', 7)
                ->where('summary.totalGenerationKwh', 10)
                ->has('stationGeneration', 1)
            );

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard', ['period' => 'month']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('period', 'month')
                ->has('generationTrend', 12)
                ->where('generationTrend.0.generationKwh', 3)
                ->has('stationGeneration', 1)
            );

        $this->actingAs(User::factory()->create())
            ->get(route('dashboard', ['period' => 'year']))
            ->assertInertia(fn (Assert $page) => $page
                ->where('period', 'year')
                ->has('generationTrend', 12)
                ->has('payoutTrend', 12)
            );
    }

    public function test_station_status_and_reading_search_filters_work(): void
    {
        $station = $this->createPowerStation();
        $station->update(['station_status' => 'Maintenance']);

        $reading = PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '12.345',
            'peak_mw' => '2.500',
            'reading_timestamp' => now()->startOfDay(),
            'feed_in_tariff_rate' => '0.1250',
            'peak_drop_alert' => true,
        ]);
        PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '10.000',
            'peak_mw' => '2.000',
            'reading_timestamp' => now()->startOfDay()->addHour(),
            'feed_in_tariff_rate' => '0.1250',
            'peak_drop_alert' => false,
        ]);

        $this->get(route('power-stations.index', ['status' => 'maintenance']))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerStation/index')
                ->where('filters.status', 'maintenance')
                ->where('powerStations.total', 1)
            );

        $this->get(route('power-stations.index', ['search' => $station->station_code]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerStation/index')
                ->where('filters.search', $station->station_code)
                ->where('powerStations.total', 1)
            );

        $this->get(route('power-readings.index', [
            'search' => (string) $reading->reading_id,
            'from' => now()->toDateString(),
            'to' => now()->toDateString(),
        ]))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerReading/index')
                ->where('filters.search', (string) $reading->reading_id)
                ->where('filters.from', now()->toDateString())
                ->has('powerReadings.data', 1)
                ->where('powerReadings.data.0.reading_id', $reading->reading_id)
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
        $this->withoutVite()
            ->get(route('power-readings.create'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerReading/create')
                ->where('powerStations.0.station_code', $station->station_code)
                ->where('powerStations.0.installed_capacity_mw', '3.500')
            );

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
        $this->withoutVite()
            ->get(route('power-readings.edit', $reading->reading_id))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerReading/create')
                ->where('powerStations.0.station_code', $station->station_code)
                ->where('powerStations.0.installed_capacity_mw', '3.500')
            );

        $data['kwh_generated'] = '20.000';
        $data['reading_timestamp'] = now()->addYear()->format('Y-m-d\TH:i');
        $this->put(route('power-readings.update', $reading->reading_id), $data)
            ->assertSessionHasErrors('reading_timestamp');

        $data['reading_timestamp'] = now()->subDays(6)->format('Y-m-d\TH:i');
        $this->put(route('power-readings.update', $reading->reading_id), $data)
            ->assertRedirect(route('power-readings.index'));
        $reading->refresh();

        $this->withoutVite()
            ->get(route('power-readings.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('PowerReading/index')
                ->has('powerReadings.data', 1)
                ->where('powerReadings.data.0.station.station_code', $station->station_code)
                ->where('powerReadings.data.0.kwh_generated', '20.000')
                ->where('powerReadings.data.0.gross_payout', '2.50')
                ->where('powerReadings.data.0.reading_timestamp_display', $reading->reading_timestamp->format('Y-m-d H:i'))
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

    public function test_power_reading_numeric_values_cannot_exceed_database_column_limits(): void
    {
        $station = $this->createPowerStation();
        $reading = PowerReading::create([
            'station_code' => $station->station_code,
            'kwh_generated' => '12.345',
            'peak_mw' => '2.500',
            'reading_timestamp' => now()->startOfDay(),
            'feed_in_tariff_rate' => '0.1250',
        ]);
        $data = [
            'station_code' => $station->station_code,
            'kwh_generated' => '100000000000',
            'peak_mw' => '1000000000',
            'reading_timestamp' => now()->format('Y-m-d\TH:i'),
            'feed_in_tariff_rate' => str_repeat('9', 200),
        ];

        $this->post(route('power-readings.store'), $data)
            ->assertSessionHasErrors([
                'kwh_generated',
                'peak_mw',
                'feed_in_tariff_rate',
            ]);

        $this->put(route('power-readings.update', $reading->reading_id), $data)
            ->assertSessionHasErrors([
                'kwh_generated',
                'peak_mw',
                'feed_in_tariff_rate',
            ]);

        $this->assertDatabaseCount('power_readings', 1);
        $this->assertDatabaseHas('power_readings', [
            'reading_id' => $reading->reading_id,
            'feed_in_tariff_rate' => '0.1250',
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