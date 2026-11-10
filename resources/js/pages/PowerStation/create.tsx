import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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

export default function PowerStationCreate({ stationTypes, operators, gridZones, powerStation }: Props) {
	const editing = Boolean(powerStation);
	const { data, setData, post, put, processing, errors } = useForm({
		station_code: powerStation?.station_code ?? '',
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
			<main className="max-w-3xl space-y-6 p-6">
				<header>
					<h1 className="text-2xl font-semibold">{editing ? 'Edit power station' : 'Add power station'}</h1>
					<p className="mt-1 text-sm text-muted-foreground">Station identity and grid assignment.</p>
				</header>
				<form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
					<label className="grid gap-2 text-sm font-medium">Station code
						<input className="rounded-md border bg-background px-3 py-2 font-normal" maxLength={100} required value={data.station_code} onChange={(event) => setData('station_code', event.target.value.toUpperCase())} />
						{errors.station_code && <span className="font-normal text-destructive">{errors.station_code}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Installed capacity (MW)
						<input type="number" min="0.001" max="999999999.999" step="0.001" required className="rounded-md border bg-background px-3 py-2 font-normal" value={data.installed_capacity_mw} onChange={(event) => setData('installed_capacity_mw', event.target.value)} />
						{errors.installed_capacity_mw && <span className="font-normal text-destructive">{errors.installed_capacity_mw}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Status
						<input className="rounded-md border bg-background px-3 py-2 font-normal" maxLength={50} required value={data.station_status} onChange={(event) => setData('station_status', event.target.value)} />
						{errors.station_status && <span className="font-normal text-destructive">{errors.station_status}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Station type
						<select className="rounded-md border bg-background px-3 py-2 font-normal" required value={data.station_type_id} onChange={(event) => setData('station_type_id', event.target.value)}>
							<option value="">{stationTypes.length ? 'Select a type' : 'No station types available'}</option>
							{stationTypes.map((option) => <option key={option.station_type_id} value={option.station_type_id}>{option.type_name}</option>)}
						</select>
						{errors.station_type_id && <span className="font-normal text-destructive">{errors.station_type_id}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium">Operator
						<select className="rounded-md border bg-background px-3 py-2 font-normal" required value={data.operator_id} onChange={(event) => setData('operator_id', event.target.value)}>
							<option value="">{operators.length ? 'Select an operator' : 'No operators available'}</option>
							{operators.map((option) => <option key={option.operator_id} value={option.operator_id}>{option.operator_name}</option>)}
						</select>
						{errors.operator_id && <span className="font-normal text-destructive">{errors.operator_id}</span>}
					</label>
					<label className="grid gap-2 text-sm font-medium sm:col-span-2">Grid zone
						<select className="rounded-md border bg-background px-3 py-2 font-normal" required value={data.grid_zone_id} onChange={(event) => setData('grid_zone_id', event.target.value)}>
							<option value="">{gridZones.length ? 'Select a grid zone' : 'No grid zones available'}</option>
							{gridZones.map((option) => <option key={option.grid_zone_id} value={option.grid_zone_id}>{option.zone_name}</option>)}
						</select>
						{errors.grid_zone_id && <span className="font-normal text-destructive">{errors.grid_zone_id}</span>}
					</label>
					<div className="flex gap-3 sm:col-span-2">
						<button disabled={processing} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">{editing ? 'Save changes' : 'Create station'}</button>
						<Link href={route('power-stations.index')} className="rounded-md border px-4 py-2 text-sm">Cancel</Link>
					</div>
				</form>
			</main>
		</AppLayout>
	);
}
