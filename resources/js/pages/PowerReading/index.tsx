import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Reading {
	reading_id: number;
	station_code: string;
	kwh_generated: string;
	peak_mw: string;
	reading_timestamp: string;
	feed_in_tariff_rate: string;
	gross_payout: string;
	station?: { station_code: string };
}

interface Props {
	powerReadings: {
		data: Reading[];
		links: { url: string | null; label: string; active: boolean }[];
	};
}

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Power readings', href: '/power-readings' },
];

export default function PowerReadingIndex({ powerReadings }: Props) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Power readings" />
			<main className="space-y-6 p-6">
				<header className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold">Power readings</h1>
						<p className="mt-1 text-sm text-muted-foreground">Review generation readings and feed-in rates.</p>
					</div>
					<Link href={route('power-readings.create')} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add reading</Link>
				</header>
				<div className="overflow-x-auto border-y">
					<table className="w-full min-w-[760px] text-left text-sm">
						<thead className="border-b bg-muted/50 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Timestamp</th>
								<th className="px-4 py-3 font-medium">Station</th>
								<th className="px-4 py-3 font-medium">Generated (kWh)</th>
								<th className="px-4 py-3 font-medium">Peak (MW)</th>
								<th className="px-4 py-3 font-medium">Tariff rate</th>
								<th className="px-4 py-3 font-medium">Gross payout</th>
								<th className="px-4 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{powerReadings.data.map((reading) => (
								<tr key={reading.reading_id} className="border-b last:border-0">
									<td className="px-4 py-3">{reading.reading_timestamp}</td>
									<td className="px-4 py-3">{reading.station?.station_code ?? reading.station_code}</td>
									<td className="px-4 py-3">{reading.kwh_generated}</td>
									<td className="px-4 py-3">{reading.peak_mw}</td>
									<td className="px-4 py-3">{reading.feed_in_tariff_rate}</td>
									<td className="px-4 py-3">{reading.gross_payout}</td>
									<td className="px-4 py-3"><div className="flex gap-3"><Link href={route('power-readings.edit', reading.reading_id)} className="underline underline-offset-4">Edit</Link><button type="button" className="text-destructive underline underline-offset-4" onClick={() => router.delete(route('power-readings.destroy', reading.reading_id))}>Delete</button></div></td>
								</tr>
							))}
							{powerReadings.data.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No power readings found.</td></tr>}
						</tbody>
					</table>
				</div>
				<nav aria-label="Pagination" className="flex flex-wrap gap-2">
					{powerReadings.links.map((link, index) => link.url ? <Link key={index} href={link.url} className={`rounded border px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} /> : <span key={index} className="rounded border px-3 py-1.5 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: link.label }} />)}
				</nav>
			</main>
		</AppLayout>
	);
}
