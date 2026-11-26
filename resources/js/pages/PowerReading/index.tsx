import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Reading {
    reading_id: number;
    station_code: string;
    kwh_generated: string;
    peak_mw: string;
    reading_timestamp: string;
    reading_timestamp_display: string;
    feed_in_tariff_rate: string;
    gross_payout: string;
    station?: { station_code: string };
}

interface Props {
    filters: {
        search: string;
        from: string;
        to: string;
    };
    powerReadings: {
        data: Reading[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Power readings', href: '/power-readings' }];

function formatDecimal(value: string, decimalPlaces: number): string {
    const match = value.trim().match(/^(-?)(\d+)(?:\.(\d+))?$/);
    if (!match) return value;

    const [, sign, whole, decimals = ''] = match;
    return `${sign}${BigInt(whole).toLocaleString()}.${decimals.padEnd(decimalPlaces, '0').slice(0, decimalPlaces)}`;
}

function NumberWithBreaks({
    value,
    decimalPlaces,
    prefix = '',
    suffix = '',
}: {
    value: string;
    decimalPlaces: number;
    prefix?: string;
    suffix?: string;
}) {
    const groups = formatDecimal(value, decimalPlaces).split(',');

    return (
        <>
            {prefix}
            {groups.map((group, index) => (
                <span key={index}>
                    {index > 0 ? ',' : ''}
                    {group}
                    {index < groups.length - 1 && <wbr />}
                </span>
            ))}
            {suffix}
        </>
    );
}

export default function PowerReadingIndex({ powerReadings, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    useEffect(() => {
        const normalizedSearch = search.trim();
        if (normalizedSearch === filters.search && from === filters.from && to === filters.to) return;
        const timer = window.setTimeout(() => {
            router.get(
                route('power-readings.index'),
                { search: normalizedSearch || undefined, from: from || undefined, to: to || undefined },
                { preserveScroll: true, preserveState: true, replace: true },
            );
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search, from, to, filters.search, filters.from, filters.to]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Power readings" />
            <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 md:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Activity className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">Meter data</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Power readings</h1>
                            <p className="text-muted-foreground mt-1 text-sm">Review generation, peak output, and feed-in rates.</p>
                        </div>
                    </div>
                    <Link
                        href={route('power-readings.create')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                    >
                        <Plus className="size-4" aria-hidden="true" /> Add reading
                    </Link>
                </header>

                <section className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold">Reading history</h2>
                            <p className="text-muted-foreground mt-1 text-sm">Latest meter records and feed-in payout estimates.</p>
                        </div>
                        <div className="grid w-full gap-2 sm:grid-cols-[minmax(180px,1.3fr)_minmax(130px,1fr)_minmax(130px,1fr)] lg:w-auto">
                            <label className="relative">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Station code or ID"
                                    aria-label="Search readings by station code or reading ID"
                                    className="bg-background w-full min-w-0 rounded-md border py-2 pr-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>
                            <label className="text-muted-foreground flex items-center gap-2 text-sm">
                                <span className="sr-only">From date</span>
                                <input
                                    type="date"
                                    value={from}
                                    max={to || undefined}
                                    onChange={(event) => setFrom(event.target.value)}
                                    aria-label="From date"
                                    className="bg-background w-full min-w-0 rounded-md border px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>
                            <label className="text-muted-foreground flex items-center gap-2 text-sm">
                                <span className="sr-only">To date</span>
                                <input
                                    type="date"
                                    value={to}
                                    min={from || undefined}
                                    onChange={(event) => setTo(event.target.value)}
                                    aria-label="To date"
                                    className="bg-background w-full min-w-0 rounded-md border px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </label>
                        </div>
                    </div>
                    {powerReadings.data.length > 0 ? (
                        <div className="w-full">
                            <table className="w-full table-fixed text-left text-xs sm:text-sm">
                                <thead className="bg-muted/40 text-muted-foreground border-b">
                                    <tr>
                                        <th className="px-2 py-3 font-medium sm:px-3">Station</th>
                                        <th className="px-2 py-3 text-right font-medium sm:px-3">Generated</th>
                                        <th className="px-2 py-3 text-right font-medium sm:px-3">Peak output</th>
                                        <th className="px-2 py-3 text-right font-medium sm:px-3">Tariff rate</th>
                                        <th className="px-2 py-3 text-right font-medium sm:px-3">Gross payout</th>
                                        <th className="px-2 py-3 font-medium sm:px-3">Timestamp</th>
                                        <th className="px-2 py-3 font-medium sm:px-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {powerReadings.data.map((reading) => (
                                        <tr key={reading.reading_id} className="hover:bg-muted/30 border-b transition-colors last:border-0">
                                            <td className="break-words px-2 py-4 font-semibold sm:px-3">
                                                {reading.station?.station_code ?? reading.station_code}
                                            </td>
                                            <td className="break-words px-2 py-4 text-right font-medium tabular-nums sm:px-3">
                                                <NumberWithBreaks value={reading.kwh_generated} decimalPlaces={3} />{' '}
                                                <span className="text-muted-foreground font-normal">kWh</span>
                                            </td>
                                            <td className="break-words px-2 py-4 text-right font-medium tabular-nums sm:px-3">
                                                <NumberWithBreaks value={reading.peak_mw} decimalPlaces={3} />{' '}
                                                <span className="text-muted-foreground font-normal">MW</span>
                                            </td>
                                            <td className="break-words px-2 py-4 text-right tabular-nums sm:px-3">
                                                <NumberWithBreaks value={reading.feed_in_tariff_rate} decimalPlaces={4} prefix="PHP " suffix="/kWh" />
                                            </td>
                                            <td className="break-words px-2 py-4 text-right font-semibold tabular-nums sm:px-3">
                                                <NumberWithBreaks value={reading.gross_payout} decimalPlaces={2} prefix="PHP " />
                                            </td>
                                            <td className="text-muted-foreground break-words px-2 py-4 tabular-nums sm:px-3">
                                                {reading.reading_timestamp_display}
                                            </td>
                                            <td className="px-2 py-4 sm:px-3">
                                                <div className="flex flex-wrap gap-x-2 gap-y-1">
                                                    <Link
                                                        href={route('power-readings.edit', reading.reading_id)}
                                                        className="font-medium underline-offset-4 hover:text-blue-700 hover:underline dark:hover:text-blue-400"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="text-destructive font-medium underline-offset-4 hover:underline"
                                                        onClick={() => router.delete(route('power-readings.destroy', reading.reading_id))}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                            <p className="mt-3 font-semibold">{filters.search || filters.from || filters.to ? 'No matching readings' : 'No readings yet'}</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {filters.search || filters.from || filters.to
                                    ? 'Try a different station ID or date range.'
                                    : 'Add a meter reading to see generation data here.'}
                            </p>
                            {!filters.search && !filters.from && !filters.to && (
                                <Link
                                    href={route('power-readings.create')}
                                    className="bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                >
                                    <Plus className="size-4" aria-hidden="true" /> Add reading
                                </Link>
                            )}
                        </div>
                    )}
                    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2 border-t px-5 py-4">
                        {powerReadings.links.map((link, index) => {
                            const className = `rounded-lg border px-3 py-2 text-sm transition ${link.active ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'bg-card hover:bg-muted'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`;

                            return link.url ? (
                                <Link key={index} href={link.url} className={className} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span key={index} className={className} dangerouslySetInnerHTML={{ __html: link.label }} />
                            );
                        })}
                    </nav>
                </section>
            </main>
        </AppLayout>
    );
}
