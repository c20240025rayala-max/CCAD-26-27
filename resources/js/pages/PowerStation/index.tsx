import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Factory, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PowerStation {
    station_code: string;
    station_status: string;
    installed_capacity_mw: string;
    station_type?: { type_name: string };
    operator?: { operator_name: string };
    grid_zone?: { zone_name: string };
}

interface Props {
    filters: {
        search: string;
        status: string;
        sort: string;
    };
    powerStations: {
        data: PowerStation[];
        links: { url: string | null; label: string; active: boolean }[];
        total: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Power stations', href: '/power-stations' }];

function statusClassName(status: string) {
    switch (status.toLowerCase()) {
        case 'active':
        case 'online':
        case 'operational':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        case 'maintenance':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
        case 'inactive':
        case 'offline':
            return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export default function PowerStationIndex({ powerStations, filters }: Props) {
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        const normalizedSearch = search.trim();
        if (normalizedSearch === filters.search) return;
        const timer = window.setTimeout(() => {
            router.get(
                route('power-stations.index'),
                { search: normalizedSearch || undefined, status: filters.status || undefined, sort: filters.sort || undefined },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search, filters.search, filters.status, filters.sort]);

    const updateFilter = (key: 'status' | 'sort', value: string) => {
        router.get(
            route('power-stations.index'),
            {
                search: search.trim() || undefined,
                status: key === 'status' ? value || undefined : filters.status || undefined,
                sort: key === 'sort' ? value || undefined : filters.sort || undefined,
            },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Power stations" />
            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <Factory className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-400">Assets</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Power stations</h1>
                            <p className="text-muted-foreground mt-1 text-sm">Manage stations, operators, and grid assignments.</p>
                        </div>
                    </div>
                    <Link
                        href={route('power-stations.create')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Add station
                    </Link>
                </header>

                <section className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold">Station directory</h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Showing {powerStations.data.length} of {powerStations.total} stations
                            </p>
                        </div>
                        <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-3">
                            <label className="relative sm:col-span-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search stations"
                                    aria-label="Search stations"
                                    className="bg-background w-full rounded-md border py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>
                            <select
                                aria-label="Filter by status"
                                value={filters.status}
                                onChange={(event) => updateFilter('status', event.target.value)}
                                className="bg-background rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">All statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                            <select
                                aria-label="Sort stations"
                                value={filters.sort}
                                onChange={(event) => updateFilter('sort', event.target.value)}
                                className="bg-background rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="station_code">Sort: code</option>
                                <option value="station_status">Sort: status</option>
                                <option value="installed_capacity_mw">Sort: capacity</option>
                            </select>
                        </div>
                    </div>
                    <div className="w-full">
                        <table className="w-full table-fixed text-left text-xs sm:text-sm">
                            <thead className="bg-muted/40 text-muted-foreground border-b">
                                <tr>
                                    <th className="px-3 py-3 font-medium sm:px-5">Code</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Type</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Operator</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Grid zone</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Status</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Capacity</th>
                                    <th className="px-3 py-3 font-medium sm:px-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {powerStations.data.map((station) => (
                                    <tr key={station.station_code} className="hover:bg-muted/30 border-b transition-colors last:border-0">
                                        <td className="px-3 py-4 font-semibold break-all sm:px-5">{station.station_code}</td>
                                        <td className="px-3 py-4 break-words sm:px-5">{station.station_type?.type_name ?? '—'}</td>
                                        <td className="px-3 py-4 break-words sm:px-5">{station.operator?.operator_name ?? '—'}</td>
                                        <td className="px-3 py-4 break-words sm:px-5">{station.grid_zone?.zone_name ?? '—'}</td>
                                        <td className="px-3 py-4 break-words sm:px-5">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(station.station_status)}`}
                                            >
                                                {station.station_status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 break-words tabular-nums sm:px-5">
                                            {station.installed_capacity_mw} <span className="text-muted-foreground">MW</span>
                                        </td>
                                        <td className="px-3 py-4 sm:px-5">
                                            <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                <Link
                                                    href={route('power-stations.edit', station.station_code)}
                                                    className="text-foreground font-medium underline-offset-4 hover:text-emerald-700 hover:underline dark:hover:text-emerald-400"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="text-destructive font-medium underline-offset-4 hover:underline"
                                                    onClick={() => router.delete(route('power-stations.destroy', station.station_code))}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {powerStations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-14 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="bg-muted text-muted-foreground rounded-full p-3">
                                                    <Factory className="size-5" aria-hidden="true" />
                                                </div>
                                                <p className="mt-3 font-semibold">{filters.search || filters.status ? 'No matching stations' : 'No power stations yet'}</p>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {filters.search || filters.status
                                                        ? 'Try a different search term or status filter.'
                                                        : 'Add a station to start tracking generation capacity.'}
                                                </p>
                                                {!filters.search && !filters.status && (
                                                    <Link
                                                        href={route('power-stations.create')}
                                                        className="bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                                    >
                                                        <Plus className="size-4" aria-hidden="true" /> Add station
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
                    {powerStations.links.map((link, index) => {
                        const className = `rounded-lg border px-3 py-2 text-sm transition ${link.active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'bg-card hover:bg-muted'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`;

                        return link.url ? (
                            <Link key={index} href={link.url} className={className} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ) : (
                            <span key={index} className={className} dangerouslySetInnerHTML={{ __html: link.label }} />
                        );
                    })}
                </nav>
            </main>
        </AppLayout>
    );
}
