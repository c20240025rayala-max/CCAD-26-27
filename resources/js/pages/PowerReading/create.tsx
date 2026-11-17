import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface StationOption {
    station_code: string;
    installed_capacity_mw: string | null;
}

interface Reading {
    reading_id: number;
    station_code: string;
    kwh_generated: string;
    peak_mw: string;
    reading_timestamp: string;
    feed_in_tariff_rate: string;
}

interface Props {
    powerStations: StationOption[];
    powerReading?: Reading;
}

const fieldClassName =
    'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function PowerReadingCreate({ powerStations, powerReading }: Props) {
    const editing = Boolean(powerReading);
    const now = new Date();
    const currentReadingTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
    const firstDayOfCurrentYear = `${now.getFullYear()}-01-01T00:00`;
    const { data, setData, post, put, processing, errors } = useForm({
        station_code: powerReading?.station_code ?? '',
        kwh_generated: powerReading?.kwh_generated ?? '',
        peak_mw: powerReading?.peak_mw ?? '',
        reading_timestamp: powerReading?.reading_timestamp?.slice(0, 16) ?? currentReadingTime,
        feed_in_tariff_rate: powerReading?.feed_in_tariff_rate ?? '',
    });
    const selectedStation = powerStations.find((station) => station.station_code === data.station_code);
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Power readings', href: '/power-readings' },
        { title: editing ? 'Edit reading' : 'Add reading', href: '#' },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        if (editing && powerReading) {
            put(route('power-readings.update', powerReading.reading_id));
        } else {
            post(route('power-readings.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit power reading' : 'Add power reading'} />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
                <header className="flex items-center gap-4">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Activity className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">Meter data</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{editing ? 'Edit reading' : 'Add a reading'}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Record the station generation and peak output.</p>
                    </div>
                </header>
                <section className="bg-card rounded-2xl border shadow-sm">
                    <div className="border-b px-5 py-4 md:px-7">
                        <h2 className="font-semibold">Reading details</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Enter the values recorded by the meter.</p>
                    </div>
                    <form onSubmit={submit} className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 md:p-7">
                        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                            Power station
                            <select
                                className={fieldClassName}
                                required
                                value={data.station_code}
                                onChange={(event) => setData('station_code', event.target.value)}
                            >
                                <option value="">Select a station</option>
                                {powerStations.map((station) => (
                                    <option key={station.station_code} value={station.station_code}>
                                        {station.station_code} ({station.installed_capacity_mw ?? 'capacity not set'} MW)
                                    </option>
                                ))}
                            </select>
                            {errors.station_code && <span className="text-destructive text-xs font-normal">{errors.station_code}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Generated (kWh)
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                required
                                className={fieldClassName}
                                value={data.kwh_generated}
                                onChange={(event) => setData('kwh_generated', event.target.value)}
                            />
                            {errors.kwh_generated && <span className="text-destructive text-xs font-normal">{errors.kwh_generated}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Peak output (MW)
                            <input
                                type="number"
                                min="0"
                                max={selectedStation?.installed_capacity_mw ?? undefined}
                                step="0.001"
                                required
                                className={fieldClassName}
                                value={data.peak_mw}
                                onChange={(event) => setData('peak_mw', event.target.value)}
                            />
                            {errors.peak_mw && <span className="text-destructive text-xs font-normal">{errors.peak_mw}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Reading date and time
                            <input
                                type="datetime-local"
                                min={firstDayOfCurrentYear}
                                max={currentReadingTime}
                                required
                                className={fieldClassName}
                                value={data.reading_timestamp}
                                onChange={(event) => setData('reading_timestamp', event.target.value)}
                            />
                            {errors.reading_timestamp && <span className="text-destructive text-xs font-normal">{errors.reading_timestamp}</span>}
                            <span className="text-muted-foreground text-xs font-normal">
                                Use the actual local reading time. Dates are limited to the current year.
                            </span>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Feed-in tariff rate
                            <input
                                type="number"
                                min="0"
                                step="0.0001"
                                required
                                className={fieldClassName}
                                value={data.feed_in_tariff_rate}
                                onChange={(event) => setData('feed_in_tariff_rate', event.target.value)}
                            />
                            {errors.feed_in_tariff_rate && <span className="text-destructive text-xs font-normal">{errors.feed_in_tariff_rate}</span>}
                        </label>
                        <div className="flex flex-wrap gap-3 border-t pt-5 sm:col-span-2">
                            <button
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {editing ? 'Save changes' : 'Create reading'}
                            </button>
                            <Link
                                href={route('power-readings.index')}
                                className="hover:bg-muted rounded-lg border px-5 py-2.5 text-sm font-medium transition"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </section>
            </main>
        </AppLayout>
    );
}
