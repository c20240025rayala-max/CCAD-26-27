import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface PowerStation {
	station_code: string;
	station_status: string;
	station_type?: { type_name: string };
	operator?: { operator_name: string };
	grid_zone?: { zone_name: string };
}

interface Props {
	powerStations: {
		data: PowerStation[];
		links: { url: string | null; label: string; active: boolean }[];
	};
}

const breadcrumbs: BreadcrumbItem[] = [
	{ title: 'Power stations', href: '/power-stations' },
];

export default function PowerStationIndex({ powerStations }: Props) {
	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title="Power stations" />
			<main className="space-y-6 p-6">
				<header className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-semibold">Power stations</h1>
						<p className="mt-1 text-sm text-muted-foreground">Manage stations and their grid assignments.</p>
					</div>
					<Link href={route('power-stations.create')} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
						Add station
					</Link>
				</header>

				<div className="overflow-x-auto border-y">
					<table className="w-full min-w-[720px] text-left text-sm">
						<thead className="border-b bg-muted/50 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">Code</th>
								<th className="px-4 py-3 font-medium">Type</th>
								<th className="px-4 py-3 font-medium">Operator</th>
								<th className="px-4 py-3 font-medium">Grid zone</th>
								<th className="px-4 py-3 font-medium">Status</th>
								<th className="px-4 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{powerStations.data.map((station) => (
								<tr key={station.station_code} className="border-b last:border-0">
									<td className="px-4 py-3 font-medium">{station.station_code}</td>
									<td className="px-4 py-3">{station.station_type?.type_name ?? '—'}</td>
									<td className="px-4 py-3">{station.operator?.operator_name ?? '—'}</td>
									<td className="px-4 py-3">{station.grid_zone?.zone_name ?? '—'}</td>
									<td className="px-4 py-3">{station.station_status}</td>
									<td className="px-4 py-3">
										<div className="flex gap-3">
											<Link href={route('power-stations.edit', station.station_code)} className="underline underline-offset-4">Edit</Link>
											<button type="button" className="text-destructive underline underline-offset-4" onClick={() => router.delete(route('power-stations.destroy', station.station_code))}>Delete</button>
										</div>
									</td>
								</tr>
							))}
							{powerStations.data.length === 0 && (
								<tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No power stations found.</td></tr>
							)}
						</tbody>
					</table>
				</div>

				<nav aria-label="Pagination" className="flex flex-wrap gap-2">
					{powerStations.links.map((link, index) => link.url ? (
						<Link key={index} href={link.url} className={`rounded border px-3 py-1.5 text-sm ${link.active ? 'bg-primary text-primary-foreground' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
					) : (
						<span key={index} className="rounded border px-3 py-1.5 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: link.label }} />
					))}
				</nav>
			</main>
		</AppLayout>
	);
}
