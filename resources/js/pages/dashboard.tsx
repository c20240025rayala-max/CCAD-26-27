import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, ArrowRight, BookOpen, CircleDollarSign, Factory, Gauge, Plus, Zap } from 'lucide-react';

interface DashboardSummary {
    totalStations: number;
    activeStations: number;
    maintenanceStations: number;
    inactiveStations: number;
    installedCapacityMw: number;
    totalReadings: number;
    totalGenerationKwh: number;
    totalPeakOutputMw: number;
    totalGrossPayout: number;
    generationThisMonthKwh: number;
    peakOutputThisMonthMw: number;
    peakDropAlerts: number;
}

interface GenerationDay {
    date: string;
    label: string;
    generationKwh: number;
}

interface StationTypeGeneration {
    stationType: string;
    generationKwh: number;
}

interface StationGeneration {
    stationCode: string;
    generationKwh: number;
}

interface LatestStation {
    stationCode: string;
    stationType: string | null;
    operator: string | null;
    gridZone: string | null;
    status: string;
    createdAt: string | null;
}

interface RecentReading {
    readingId: number;
    stationCode: string;
    readingTimestamp: string | null;
    generationKwh: string;
    peakMw: string;
    peakDropAlert: boolean;
}

interface Props {
    summary: DashboardSummary;
    generationTrend: GenerationDay[];
    monthlyGenerationTrend: GenerationDay[];
    generationByType: StationTypeGeneration[];
    topStations: StationGeneration[];
    latestStations: LatestStation[];
    recentReadings: RecentReading[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
const currencyFormat = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PHP' });

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    iconClass,
}: {
    label: string;
    value: string;
    detail: string;
    icon: typeof Zap;
    iconClass: string;
}) {
    return (
        <div className="bg-card rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-muted-foreground text-sm font-medium">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${iconClass}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </div>
            </div>
            <p className="text-muted-foreground mt-3 text-xs">{detail}</p>
        </div>
    );
}

export default function Dashboard({
    summary,
    generationTrend,
    monthlyGenerationTrend,
    generationByType,
    topStations,
    latestStations,
    recentReadings,
}: Props) {
    const maxGeneration = Math.max(...generationTrend.map((day) => day.generationKwh), 1);
    const maxMonthlyGeneration = Math.max(...monthlyGenerationTrend.map((month) => month.generationKwh), 1);
    const maxTypeGeneration = Math.max(...generationByType.map((type) => type.generationKwh), 1);
    const maxStationGeneration = Math.max(...topStations.map((station) => station.generationKwh), 1);
    const monthLabel = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(new Date());

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
                <header className="relative isolate flex flex-wrap items-end justify-between gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-sm sm:p-8">
                    <div aria-hidden="true" className="absolute -top-20 -right-10 -z-10 size-64 rounded-full border-[32px] border-white/5" />
                    <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300 uppercase">Energy operations</p>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Power overview</h1>
                        <p className="mt-2 max-w-xl text-sm text-slate-300">Generation, station health, and meter readings at a glance.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={route('power-stations.create')}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            Add station
                        </Link>
                        <Link
                            href={route('power-readings.create')}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                        >
                            <Plus className="size-4" aria-hidden="true" />
                            Add reading
                        </Link>
                    </div>
                </header>

                <section aria-label="Power metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <MetricCard
                        label="Power stations"
                        value={numberFormat.format(summary.totalStations)}
                        detail={`${numberFormat.format(summary.installedCapacityMw)} MW installed capacity`}
                        icon={Factory}
                        iconClass="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    />
                    <MetricCard
                        label="Active stations"
                        value={numberFormat.format(summary.activeStations)}
                        detail="Active, online, or operational"
                        icon={Activity}
                        iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    />
                    <MetricCard
                        label="Inactive stations"
                        value={numberFormat.format(summary.inactiveStations)}
                        detail={`${summary.maintenanceStations} in maintenance`}
                        icon={AlertTriangle}
                        iconClass="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    />
                    <MetricCard
                        label="Power readings"
                        value={numberFormat.format(summary.totalReadings)}
                        detail="All recorded readings"
                        icon={BookOpen}
                        iconClass="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    />
                    <MetricCard
                        label="Total energy generated"
                        value={`${numberFormat.format(summary.totalGenerationKwh)} kWh`}
                        detail="Across all recorded readings"
                        icon={Zap}
                        iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    />
                    <MetricCard
                        label="Total gross payout"
                        value={currencyFormat.format(summary.totalGrossPayout)}
                        detail="Energy generated × feed-in tariff"
                        icon={CircleDollarSign}
                        iconClass="bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                    />
                    <MetricCard
                        label="Peak output"
                        value={`${numberFormat.format(summary.totalPeakOutputMw)} MW`}
                        detail="Highest recorded output"
                        icon={Gauge}
                        iconClass="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    />
                    <MetricCard
                        label="Generation this month"
                        value={`${numberFormat.format(summary.generationThisMonthKwh)} kWh`}
                        detail={monthLabel}
                        icon={Zap}
                        iconClass="bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                    />
                    <MetricCard
                        label="Peak drop alerts"
                        value={numberFormat.format(summary.peakDropAlerts)}
                        detail="Readings flagged for review"
                        icon={AlertTriangle}
                        iconClass="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    />
                </section>

                <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                    <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Daily generation</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Energy generated over the last seven days.</p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                kWh
                            </span>
                        </div>
                        <div className="mt-6 grid h-48 grid-cols-7 gap-2 sm:gap-4">
                            {generationTrend.map((day) => {
                                const barHeight = day.generationKwh > 0 ? Math.max((day.generationKwh / maxGeneration) * 100, 5) : 2;

                                return (
                                    <div key={day.date} className="flex min-w-0 flex-col items-center justify-end gap-2">
                                        <span
                                            className="text-muted-foreground max-w-full truncate text-[10px] sm:text-xs"
                                            title={`${numberFormat.format(day.generationKwh)} kWh`}
                                        >
                                            {day.generationKwh > 0 ? numberFormat.format(day.generationKwh) : ''}
                                        </span>
                                        <div className="bg-muted/70 flex h-32 w-full items-end rounded-t-lg">
                                            <div
                                                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all"
                                                style={{ height: `${barHeight}%` }}
                                                title={`${day.label}: ${numberFormat.format(day.generationKwh)} kWh`}
                                            />
                                        </div>
                                        <span className="text-muted-foreground text-xs">{day.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Station status</h2>
                                <p className="text-muted-foreground mt-1 text-sm">{summary.totalStations} stations registered</p>
                            </div>
                            <Link
                                href={route('power-stations.index')}
                                className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="mt-5 space-y-5">
                            {[
                                { label: 'Active', count: summary.activeStations, color: 'bg-emerald-500' },
                                { label: 'Maintenance', count: summary.maintenanceStations, color: 'bg-amber-500' },
                                { label: 'Inactive', count: summary.inactiveStations, color: 'bg-slate-400' },
                            ].map((status) => (
                                <div key={status.label} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`size-2 rounded-full ${status.color}`} />
                                            <span>{status.label}</span>
                                        </div>
                                        <span className="text-sm font-semibold tabular-nums">{status.count}</span>
                                    </div>
                                    <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                        <div
                                            className={`h-full rounded-full ${status.color}`}
                                            style={{ width: `${summary.totalStations ? (status.count / summary.totalStations) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <Link href={route('power-stations.index')} className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                                Manage stations <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Monthly energy generation</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Generation over the last 12 months.</p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                kWh
                            </span>
                        </div>
                        <div className="mt-6 grid h-48 grid-cols-6 gap-2 sm:grid-cols-12 sm:gap-3">
                            {monthlyGenerationTrend.map((month) => {
                                const barHeight = month.generationKwh > 0 ? Math.max((month.generationKwh / maxMonthlyGeneration) * 100, 5) : 2;

                                return (
                                    <div key={month.date} className="flex min-w-0 flex-col items-center justify-end gap-2">
                                        <div className="bg-muted/70 flex h-32 w-full items-end rounded-t-lg">
                                            <div
                                                className="w-full rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400"
                                                style={{ height: `${barHeight}%` }}
                                                title={`${month.label}: ${numberFormat.format(month.generationKwh)} kWh`}
                                            />
                                        </div>
                                        <span className="text-muted-foreground text-[10px] sm:text-xs">{month.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
                        <h2 className="font-semibold">Generation by station type</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Solar, wind, and other types grouped by generated energy.</p>
                        {generationByType.length ? (
                            <div className="mt-6 space-y-5">
                                {generationByType.map((type) => (
                                    <div key={type.stationType} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="font-medium">{type.stationType}</span>
                                            <span className="text-muted-foreground tabular-nums">{numberFormat.format(type.generationKwh)} kWh</span>
                                        </div>
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400"
                                                style={{ width: `${(type.generationKwh / maxTypeGeneration) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground py-12 text-center text-sm">Generation by type will appear when readings are recorded.</p>
                        )}
                    </div>
                </section>

                <section className="grid gap-4 xl:grid-cols-2">
                    <div className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold">Power generation by station</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Top five stations by recorded energy.</p>
                            </div>
                            <Link href={route('power-stations.index')} className="text-sm font-medium hover:underline">View stations</Link>
                        </div>
                        {topStations.length ? (
                            <div className="mt-5 space-y-4">
                                {topStations.map((station) => (
                                    <div key={station.stationCode} className="space-y-2">
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="font-medium">{station.stationCode}</span>
                                            <span className="text-muted-foreground tabular-nums">{numberFormat.format(station.generationKwh)} kWh</span>
                                        </div>
                                        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(station.generationKwh / maxStationGeneration) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground py-12 text-center text-sm">Station totals will appear when readings are recorded.</p>
                        )}
                    </div>
                    <div className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                        <div className="flex items-center justify-between gap-3 border-b p-5">
                            <div>
                                <h2 className="font-semibold">Latest registered stations</h2>
                                <p className="text-muted-foreground mt-1 text-sm">Most recently added power stations.</p>
                            </div>
                            <Link href={route('power-stations.index')} className="text-sm font-medium hover:underline">View all</Link>
                        </div>
                        {latestStations.length ? (
                            <ul className="divide-y">
                                {latestStations.map((station) => (
                                    <li key={station.stationCode} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium">{station.stationCode}</p>
                                            <p className="text-muted-foreground mt-0.5 text-xs">
                                                {[station.stationType, station.operator, station.gridZone].filter(Boolean).join(' · ') || 'Station details unavailable'}
                                            </p>
                                        </div>
                                        <span className="text-muted-foreground text-xs">{station.createdAt ?? '—'}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground px-5 py-12 text-center text-sm">No power stations have been registered.</p>
                        )}
                    </div>
                </section>

                <section className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
                        <div>
                            <h2 className="font-semibold">Recent readings</h2>
                            <p className="text-muted-foreground mt-1 text-sm">Latest generation and peak output records.</p>
                        </div>
                        <Link href={route('power-readings.index')} className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
                            All readings <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>
                    {recentReadings.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
                                    <tr>
                                        <th className="px-5 py-3 font-medium">Station</th>
                                        <th className="px-5 py-3 font-medium">Reading time</th>
                                        <th className="px-5 py-3 font-medium">Generated</th>
                                        <th className="px-5 py-3 font-medium">Peak output</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentReadings.map((reading) => (
                                        <tr key={reading.readingId} className="border-t">
                                            <td className="px-5 py-3 font-medium">{reading.stationCode}</td>
                                            <td className="text-muted-foreground px-5 py-3">{reading.readingTimestamp ?? '—'}</td>
                                            <td className="px-5 py-3 tabular-nums">{numberFormat.format(Number(reading.generationKwh))} kWh</td>
                                            <td className="px-5 py-3 tabular-nums">{numberFormat.format(Number(reading.peakMw))} MW</td>
                                            <td className="px-5 py-3">
                                                {reading.peakDropAlert ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                        <AlertTriangle className="size-3.5" aria-hidden="true" /> Review
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <Activity className="size-3.5" aria-hidden="true" /> Normal
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center px-6 py-10 text-center">
                            <div className="bg-muted text-muted-foreground rounded-full p-3">
                                <Activity className="size-5" aria-hidden="true" />
                            </div>
                            <p className="mt-3 font-medium">No readings yet</p>
                            <p className="text-muted-foreground mt-1 text-sm">Add a reading to start tracking generation.</p>
                            <Link
                                href={route('power-readings.create')}
                                className="bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
                            >
                                <Plus className="size-4" aria-hidden="true" />
                                Add reading
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}
