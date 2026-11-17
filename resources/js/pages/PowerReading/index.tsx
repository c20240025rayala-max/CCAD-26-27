import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, AlertTriangle, Plus } from 'lucide-react';

interface Reading {
    reading_id: number;
    station_code: string;
    kwh_generated: string;
    peak_mw: string;
    reading_timestamp: string;
    feed_in_tariff_rate: string;
    gross_payout: string;
    peak_drop_alert: boolean;
    station?: { station_code: string };
}

interface Props {
    powerReadings: {
        data: Reading[];
        links: { url: string | null; label: string; active: boolean }[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Power readings', href: '/power-readings' }];

export default function PowerReadingIndex({ powerReadings }: Props) {
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
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold">Reading history</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Latest meter records and anomaly flags.</p>
                    </div>
                    <div className="w-full">
                        <table className="w-full table-fixed text-left text-xs sm:text-sm">
                            <thead className="bg-muted/40 text-muted-foreground border-b">
                                <tr>
                                    <th className="px-2 py-3 font-medium sm:px-4">Timestamp</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Station</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Generated</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Peak output</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Tariff</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Gross payout</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Alert</th>
                                    <th className="px-2 py-3 font-medium sm:px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {powerReadings.data.map((reading) => (
                                    <tr key={reading.reading_id} className="hover:bg-muted/30 border-b transition-colors last:border-0">
                                        <td className="text-muted-foreground px-2 py-4 break-words sm:px-4">{reading.reading_timestamp}</td>
                                        <td className="px-2 py-4 font-semibold break-all sm:px-4">
                                            {reading.station?.station_code ?? reading.station_code}
                                        </td>
                                        <td className="px-2 py-4 break-words tabular-nums sm:px-4">
                                            {reading.kwh_generated} <span className="text-muted-foreground">kWh</span>
                                        </td>
                                        <td className="px-2 py-4 break-words tabular-nums sm:px-4">
                                            {reading.peak_mw} <span className="text-muted-foreground">MW</span>
                                        </td>
                                        <td className="px-2 py-4 break-words tabular-nums sm:px-4">{reading.feed_in_tariff_rate}</td>
                                        <td className="px-2 py-4 break-words tabular-nums sm:px-4">{reading.gross_payout}</td>
                                        <td className="px-2 py-4 break-words sm:px-4">
                                            {reading.peak_drop_alert ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                                    <AlertTriangle className="size-3.5" aria-hidden="true" /> Review
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-4 sm:px-4">
                                            <div className="flex flex-wrap gap-x-3 gap-y-1">
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
                                {powerReadings.data.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-14 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="bg-muted text-muted-foreground rounded-full p-3">
                                                    <Activity className="size-5" aria-hidden="true" />
                                                </div>
                                                <p className="mt-3 font-semibold">No readings yet</p>
                                                <p className="text-muted-foreground mt-1 text-sm">Add a meter reading to see generation data here.</p>
                                                <Link
                                                    href={route('power-readings.create')}
                                                    className="bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                                >
                                                    <Plus className="size-4" aria-hidden="true" /> Add reading
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
