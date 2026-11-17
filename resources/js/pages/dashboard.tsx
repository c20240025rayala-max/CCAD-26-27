import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, AlertTriangle, ArrowRight, Factory, Gauge, Plus, Zap } from 'lucide-react';

interface DashboardSummary {
    totalStations: number;
    activeStations: number;
    maintenanceStations: number;
    inactiveStations: number;
    installedCapacityMw: number;
    generationThisMonthKwh: number;
    peakOutputThisMonthMw: number;
    peakDropAlerts: number;
}

interface GenerationDay {
    date: string;
    label: string;
    generationKwh: number;
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
    recentReadings: RecentReading[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const numberFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

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

export default function Dashboard({ summary, generationTrend, recentReadings }: Props) {
    const maxGeneration = Math.max(...generationTrend.map((day) => day.generationKwh), 1);
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

                <section aria-label="Power metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                        label="Generation this month"
                        value={`${numberFormat.format(summary.generationThisMonthKwh)} kWh`}
                        detail={monthLabel}
                        icon={Zap}
                        iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    />
                    <MetricCard
                        label="Installed capacity"
                        value={`${numberFormat.format(summary.installedCapacityMw)} MW`}
                        detail={`${summary.totalStations} registered power stations`}
                        icon={Factory}
                        iconClass="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    />
                    <MetricCard
                        label="Peak output this month"
                        value={`${numberFormat.format(summary.peakOutputThisMonthMw)} MW`}
                        detail="Highest recorded meter output"
                        icon={Gauge}
                        iconClass="bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
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
