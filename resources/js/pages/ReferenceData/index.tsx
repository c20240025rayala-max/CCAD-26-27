import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Layers3, MapPinned, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';

type ResourceKey = 'station-types' | 'operators' | 'grid-zones';

interface ResourceConfig {
    title: string;
    singular: string;
    description: string;
    baseUrl: string;
    icon: typeof Layers3;
}

const resources: Record<ResourceKey, ResourceConfig> = {
    'station-types': {
        title: 'Station types',
        singular: 'station type',
        description: 'Organize stations by their generation technology.',
        baseUrl: '/station-types',
        icon: Layers3,
    },
    operators: {
        title: 'Operators',
        singular: 'operator',
        description: 'Manage the organizations responsible for your stations.',
        baseUrl: '/operators',
        icon: UsersRound,
    },
    'grid-zones': {
        title: 'Grid zones',
        singular: 'grid zone',
        description: 'Manage the grid zones assigned to power stations.',
        baseUrl: '/grid-zones',
        icon: MapPinned,
    },
};

interface RecordItem {
    id: number;
    name: string;
    stationCount: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    resource: ResourceKey;
    filters: { search: string };
    records: {
        data: RecordItem[];
        links: PaginationLink[];
        total: number;
    };
}

export default function ReferenceDataIndex({ resource, records, filters }: Props) {
    const config = resources[resource];
    const Icon = config.icon;
    const breadcrumbs: BreadcrumbItem[] = [{ title: config.title, href: config.baseUrl }];
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        const normalizedSearch = search.trim();
        if (normalizedSearch === filters.search) return;
        const timer = window.setTimeout(() => {
            router.get(config.baseUrl, { search: normalizedSearch || undefined }, { preserveScroll: true, preserveState: true, replace: true });
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search, filters.search, config.baseUrl]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={config.title} />
            <main className="mx-auto w-full max-w-[1200px] space-y-6 p-4 md:p-6">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            <Icon className="size-6" aria-hidden="true" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-400">Power management</p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{config.title}</h1>
                            <p className="text-muted-foreground mt-1 text-sm">{config.description}</p>
                        </div>
                    </div>
                    <Link
                        href={`${config.baseUrl}/create`}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Add {config.singular}
                    </Link>
                </header>

                <section className="bg-card overflow-hidden rounded-2xl border shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
                        <div>
                            <h2 className="font-semibold">{config.title} directory</h2>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {records.total} {records.total === 1 ? config.singular : `${config.singular}s`} in total
                            </p>
                        </div>
                        <label className="relative w-full sm:max-w-xs">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={`Search ${config.title.toLowerCase()}`}
                                aria-label={`Search ${config.title.toLowerCase()}`}
                                className="bg-background w-full rounded-md border py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </label>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead className="bg-muted/40 text-muted-foreground border-b">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Name</th>
                                    <th className="px-5 py-3 font-medium">Assigned stations</th>
                                    <th className="px-5 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.map((record) => (
                                    <tr key={record.id} className="hover:bg-muted/30 border-b last:border-0">
                                        <td className="px-5 py-4 font-medium">{record.name}</td>
                                        <td className="text-muted-foreground px-5 py-4">
                                            {record.stationCount} {record.stationCount === 1 ? 'station' : 'stations'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-4">
                                                <Link href={`${config.baseUrl}/${record.id}/edit`} className="font-medium hover:underline">
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={record.stationCount > 0}
                                                    title={record.stationCount > 0 ? 'Unassign all stations before deleting this item.' : undefined}
                                                    className="text-destructive inline-flex items-center gap-1 font-medium hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
                                                    onClick={() => {
                                                        if (window.confirm(`Delete "${record.name}"? This cannot be undone.`)) {
                                                            router.delete(`${config.baseUrl}/${record.id}`);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-3.5" aria-hidden="true" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {records.data.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-14 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="bg-muted text-muted-foreground rounded-full p-3">
                                                    <Icon className="size-5" aria-hidden="true" />
                                                </div>
                                                <p className="mt-3 font-semibold">
                                                    {filters.search ? 'No matching records' : `No ${config.title.toLowerCase()} yet`}
                                                </p>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {filters.search ? 'Try another search term.' : 'Add one to use it when managing power stations.'}
                                                </p>
                                                {!filters.search && (
                                                    <Link
                                                        href={`${config.baseUrl}/create`}
                                                        className="bg-primary text-primary-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                                                    >
                                                        <Plus className="size-4" aria-hidden="true" />
                                                        Add {config.singular}
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2 border-t px-5 py-4">
                        {records.links.map((link, index) => {
                            const className = `rounded-lg border px-3 py-2 text-sm transition ${link.active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`;

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
