import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface StationOption {
	station_code: string;
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

export default function PowerReadingCreate({ powerStations, powerReading }: Props) {
	const editing = Boolean(powerReading);
	const { data, setData, post, put, processing, errors } = useForm({
		station_code: powerReading?.station_code ?? '',
		kwh_generated: powerReading?.kwh_generated ?? '',
		peak_mw: powerReading?.peak_mw ?? '',
		reading_timestamp: powerReading?.reading_timestamp?.slice(0, 16) ?? '',
		feed_in_tariff_rate: powerReading?.feed_in_tariff_rate ?? '',
	});
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
			<main className="max-w-3xl space-y-6 p-6">
				<header>
					<h1 className="text-2xl font-semibold">{editing ? 'Edit power reading' : 'Add power reading'}</h1>
					<p className="mt-1 text-sm text-muted-foreground">Generation output and tariff details.</p>
				</header>
				<form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
					<label className="grid gap-2 text-sm font-medium sm:col-span-2">Power station
						<select className="rounded-md border bg-background px-3 py-2 font-normal" required value={data.station_code} onChange={(event) => setData('station_code', event.target.value)}>
							<option value="">Select a station</option>
							{powerStations.map((station) => <option key={station.station_code} value={station.station_code}>{station.station_code}</option>)}
						</select>
						{errors.station_code && <span className="font-normal text-destructive">{errors.station_code}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Generated (kWh)
						<input type="number" min="0" step="0.001" required className="rounded-md border bg-background px-3 py-2 font-normal" value={data.kwh_generated} onChange={(event) => setData('kwh_generated', event.target.value)} />
						{errors.kwh_generated && <span className="font-normal text-destructive">{errors.kwh_generated}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Peak output (MW)
						<input type="number" min="0" step="0.001" required className="rounded-md border bg-background px-3 py-2 font-normal" value={data.peak_mw} onChange={(event) => setData('peak_mw', event.target.value)} />
						{errors.peak_mw && <span className="font-normal text-destructive">{errors.peak_mw}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Reading date and time
						<input type="datetime-local" required className="rounded-md border bg-background px-3 py-2 font-normal" value={data.reading_timestamp} onChange={(event) => setData('reading_timestamp', event.target.value)} />
						{errors.reading_timestamp && <span className="font-normal text-destructive">{errors.reading_timestamp}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Feed-in tariff rate
						<input type="number" min="0" step="0.0001" required className="rounded-md border bg-background px-3 py-2 font-normal" value={data.feed_in_tariff_rate} onChange={(event) => setData('feed_in_tariff_rate', event.target.value)} />
						{errors.feed_in_tariff_rate && <span className="font-normal text-destructive">{errors.feed_in_tariff_rate}</span>}
					</label>
					<div className="flex gap-3 sm:col-span-2">
						<button disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{editing ? 'Save changes' : 'Create reading'}</button>
						<Link href={route('power-readings.index')} className="rounded-md border px-4 py-2 text-sm">Cancel</Link>
					</div>
				</form>
			</main>
		</AppLayout>
	);
}
