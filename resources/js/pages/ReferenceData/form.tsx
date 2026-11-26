import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Layers3, MapPinned, Save, UsersRound } from 'lucide-react';
import { type FormEventHandler } from 'react';

type ResourceKey = 'station-types' | 'operators' | 'grid-zones';

interface ResourceConfig {
    title: string;
    singular: string;
    field: string;
    baseUrl: string;
    icon: typeof Layers3;
    maxLength: number;
}

const resources: Record<ResourceKey, ResourceConfig> = {
    'station-types': {
        title: 'Station types',
        singular: 'station type',
        field: 'type_name',
        baseUrl: '/station-types',
        icon: Layers3,
        maxLength: 100,
    },
    operators: {
        title: 'Operators',
        singular: 'operator',
        field: 'operator_name',
        baseUrl: '/operators',
        icon: UsersRound,
        maxLength: 150,
    },
    'grid-zones': {
        title: 'Grid zones',
        singular: 'grid zone',
        field: 'zone_name',
        baseUrl: '/grid-zones',
        icon: MapPinned,
        maxLength: 100,
    },
};

interface Props {
    resource: ResourceKey;
    record?: {
        id: number;
        name: string;
    };
}

const fieldClassName =
    'h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function ReferenceDataForm({ resource, record }: Props) {
    const config = resources[resource];
    const editing = Boolean(record);
    const Icon = config.icon;
    const { data, setData, post, put, processing, errors } = useForm<Record<string, string>>({
        [config.field]: record?.name ?? '',
    });
    const breadcrumbs: BreadcrumbItem[] = [
        { title: config.title, href: config.baseUrl },
        { title: editing ? `Edit ${config.singular}` : `Add ${config.singular}`, href: '#' },
    ];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        if (editing && record) {
            put(`${config.baseUrl}/${record.id}`);
        } else {
            post(config.baseUrl);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${editing ? 'Edit' : 'Add'} ${config.singular}`} />
            <main className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
                <header className="flex items-center gap-4">
                    <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">Power management</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            {editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">{config.title} are used to organize power stations.</p>
                    </div>
                </header>

                <section className="bg-card rounded-2xl border shadow-sm">
                    <div className="border-b px-5 py-4">
                        <h2 className="font-semibold">{config.singular} details</h2>
                        <p className="text-muted-foreground mt-1 text-sm">Enter a clear name for this record.</p>
                    </div>
                    <form onSubmit={submit} className="space-y-5 p-5 md:p-7">
                        <label className="grid gap-2 text-sm font-medium" htmlFor={config.field}>
                            {config.title.slice(0, -1)} name
                            <input
                                id={config.field}
                                type="text"
                                required
                                maxLength={config.maxLength}
                                autoFocus
                                className={fieldClassName}
                                value={data[config.field] ?? ''}
                                onChange={(event) => setData(config.field, event.target.value)}
                                aria-invalid={Boolean(errors[config.field])}
                            />
                            {errors[config.field] && <span className="text-destructive text-xs font-normal">{errors[config.field]}</span>}
                            <span className="text-muted-foreground text-xs font-normal">Maximum {config.maxLength} characters.</span>
                        </label>
                        <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
                            <Link
                                href={config.baseUrl}
                                className="bg-muted hover:bg-muted/80 inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="size-4" aria-hidden="true" />
                                {processing ? 'Saving…' : editing ? 'Save changes' : `Create ${config.singular}`}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </AppLayout>
    );
}
