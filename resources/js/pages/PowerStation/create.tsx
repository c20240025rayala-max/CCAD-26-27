import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Factory } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface Option {
    [key: string]: number | string;
}

interface Station {
    station_code: string;
    station_type_id: number;
    operator_id: number;
    grid_zone_id: number;
    station_status: string;
    installed_capacity_mw: string;
}

interface Props {
    stationTypes: Option[];
    operators: Option[];
    gridZones: Option[];
    powerStation?: Station;
}

const stationStatuses = ['Active', 'Inactive', 'Maintenance'];
const fieldClassName =
    'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function PowerStationCreate({ stationTypes, operators, gridZones, powerStation }: Props) {
    const editing = Boolean(powerStation);
    const { data, setData, post, put, processing, errors } = useForm({
        station_type_id: String(powerStation?.station_type_id ?? ''),
        operator_id: String(powerStation?.operator_id ?? ''),
        grid_zone_id: String(powerStation?.grid_zone_id ?? ''),
        station_status: powerStation?.station_status ?? '',
        installed_capacity_mw: powerStation?.installed_capacity_mw ?? '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Power stations', href: '/power-stations' },
        { title: editing ? 'Edit station' : 'Add station', href: '#' },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        if (editing && powerStation) {
            put(route('power-stations.update', powerStation.station_code));
        } else {
            post(route('power-stations.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={editing ? 'Edit power station' : 'Add power station'} />
            <main className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6">
                <header className="flex items-center gap-4">
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        <Factory className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-400">Power station</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{editing ? 'Edit station' : 'Add a station'}</h1>
                        <p className="text-muted-foreground mt-1 text-sm">Station identity, capacity, and grid assignment.</p>
                    </div>
                </header>
                <section className="bg-card rounded-2xl border shadow-sm">
                    <div className="border-b px-5 py-4 md:px-7">
                        <h2 className="font-semibold">Station details</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Fields marked as required must be completed.</p>
                    </div>
                    <form onSubmit={submit} className="grid gap-x-6 gap-y-5 p-5 sm:grid-cols-2 md:p-7">
                        <label className="grid gap-2 text-sm font-medium">
                            Station code
                            <input
                                className={`${fieldClassName} bg-muted text-muted-foreground`}
                                readOnly
                                value={powerStation?.station_code ?? 'Generated automatically when saved'}
                            />
                            <span className="text-muted-foreground text-xs font-normal">
                                This code is generated automatically and cannot be changed.
                            </span>
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Installed capacity (MW)
                            <input
                                type="number"
                                min="0.001"
                                max="999999999.999"
                                step="0.001"
                                required
                                className={fieldClassName}
                                value={data.installed_capacity_mw}
                                onChange={(event) => setData('installed_capacity_mw', event.target.value)}
                            />
                            {errors.installed_capacity_mw && (
                                <span className="text-destructive text-xs font-normal">{errors.installed_capacity_mw}</span>
                            )}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Status
                            <select
                                className={fieldClassName}
                                required
                                value={data.station_status}
                                onChange={(event) => setData('station_status', event.target.value)}
                            >
                                <option value="">Select a status</option>
                                {stationStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                                {powerStation?.station_status && !stationStatuses.includes(powerStation.station_status) && (
                                    <option value={powerStation.station_status}>{powerStation.station_status}</option>
                                )}
                            </select>
                            {errors.station_status && <span className="text-destructive text-xs font-normal">{errors.station_status}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Station type
                            <select
                                className={fieldClassName}
                                required
                                value={data.station_type_id}
                                onChange={(event) => setData('station_type_id', event.target.value)}
                            >
                                <option value="">{stationTypes.length ? 'Select a type' : 'No station types available'}</option>
                                {stationTypes.map((option) => (
                                    <option key={option.station_type_id} value={option.station_type_id}>
                                        {option.type_name}
                                    </option>
                                ))}
                            </select>
                            {errors.station_type_id && <span className="text-destructive text-xs font-normal">{errors.station_type_id}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium">
                            Operator
                            <select
                                className={fieldClassName}
                                required
                                value={data.operator_id}
                                onChange={(event) => setData('operator_id', event.target.value)}
                            >
                                <option value="">{operators.length ? 'Select an operator' : 'No operators available'}</option>
                                {operators.map((option) => (
                                    <option key={option.operator_id} value={option.operator_id}>
                                        {option.operator_name}
                                    </option>
                                ))}
                            </select>
                            {errors.operator_id && <span className="text-destructive text-xs font-normal">{errors.operator_id}</span>}
                        </label>
                        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                            Grid zone
                            <select
                                className={fieldClassName}
                                required
                                value={data.grid_zone_id}
                                onChange={(event) => setData('grid_zone_id', event.target.value)}
                            >
                                <option value="">{gridZones.length ? 'Select a grid zone' : 'No grid zones available'}</option>
                                {gridZones.map((option) => (
                                    <option key={option.grid_zone_id} value={option.grid_zone_id}>
                                        {option.zone_name}
                                    </option>
                                ))}
                            </select>
                            {errors.grid_zone_id && <span className="text-destructive text-xs font-normal">{errors.grid_zone_id}</span>}
                        </label>
                        <div className="flex flex-wrap gap-3 border-t pt-5 sm:col-span-2">
                            <button
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {editing ? 'Save changes' : 'Create station'}
                            </button>
                            <Link
                                href={route('power-stations.index')}
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
