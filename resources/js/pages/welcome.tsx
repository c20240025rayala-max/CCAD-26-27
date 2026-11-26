import AppLogo from '@/components/app-logo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ArrowRight, BarChart3, Factory, Zap } from 'lucide-react';

const features = [
    {
        icon: Factory,
        title: 'Station management',
        description: 'Keep station capacity, operators, and grid assignments organized.',
        iconClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    },
    {
        icon: Activity,
        title: 'Meter readings',
        description: 'Record generated energy, peak output, and tariff details.',
        iconClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
        icon: BarChart3,
        title: 'Operational insights',
        description: 'Review generation trends and identify unexpected output drops.',
        iconClass: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    },
];

const workflow = [
    { number: '01', title: 'Manage stations', detail: 'Keep station and grid details current', icon: Factory },
    { number: '02', title: 'Record readings', detail: 'Capture generation and peak output', icon: Activity },
    { number: '03', title: 'Review performance', detail: 'See trends across your operation', icon: BarChart3 },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="relative isolate min-h-svh overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden">
                    <div className="absolute -top-56 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-900/15" />
                    <div className="absolute top-12 -right-36 size-80 rounded-full bg-blue-100/40 blur-3xl dark:bg-blue-900/10" />
                </div>

                <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <Link href={route('home')} aria-label="Power Management home" className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <AppLogo />
                    </Link>
                    <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
                            >
                                <span className="hidden sm:inline">Open dashboard</span>
                                <span className="sm:hidden">Dashboard</span>
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-slate-200 dark:hover:bg-slate-900 sm:px-4"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-3.5 py-2.5 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-4"
                                >
                                    Create account
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto w-full max-w-7xl space-y-20 px-4 pt-5 pb-16 sm:px-6 lg:px-8 lg:pt-8">
                    <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-9 text-white shadow-2xl shadow-slate-900/10 sm:px-10 sm:py-12 lg:px-14 lg:py-14">
                        <div aria-hidden="true" className="absolute -top-36 -right-24 -z-10 size-[30rem] rounded-full border-[52px] border-white/[0.04]" />
                        <div aria-hidden="true" className="absolute right-16 bottom-[-18rem] -z-10 size-[30rem] rounded-full bg-emerald-500/10 blur-3xl" />

                        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-2 text-[11px] font-semibold tracking-[0.14em] text-emerald-200 uppercase">
                                    <Zap className="size-3.5" aria-hidden="true" />
                                    Power operations
                                </div>
                                <h1 className="mt-6 max-w-2xl text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.6rem]">
                                    Make every reading <span className="text-emerald-300">count.</span>
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                    A clear workspace for managing power stations, monitoring generation, and keeping meter records together.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                                    >
                                        {auth.user ? 'Go to dashboard' : 'Get started'}
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                </div>
                                <p className="mt-6 text-xs text-slate-400">One place to manage assets, readings, and performance.</p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
                                <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                                    <div>
                                        <p className="text-base font-semibold">Your operations, in one place</p>
                                        <p className="mt-1 text-sm text-slate-400">A simple workflow from asset to insight</p>
                                    </div>
                                    <div className="rounded-xl border border-emerald-300/15 bg-emerald-400/10 p-3 text-emerald-300">
                                        <Zap className="size-5" aria-hidden="true" />
                                    </div>
                                </div>
                                <ol className="mt-5 space-y-3">
                                    {workflow.map(({ number, title, detail, icon: Icon }, index) => (
                                        <li key={number} className="relative flex items-center gap-4 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4 transition hover:border-white/15 hover:bg-slate-950/45">
                                            {index < workflow.length - 1 && (
                                                <span aria-hidden="true" className="absolute top-[3.25rem] left-[1.55rem] h-5 border-l border-emerald-300/20" />
                                            )}
                                            <span className="w-6 shrink-0 font-mono text-xs font-semibold text-emerald-300">{number}</span>
                                            <div className="rounded-lg bg-white/[0.08] p-2.5 text-slate-200">
                                                <Icon className="size-4" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">{title}</p>
                                                <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
                                            </div>
                                            <ArrowRight className="ml-auto size-4 shrink-0 text-slate-500" aria-hidden="true" />
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </section>

                    <section aria-labelledby="features-heading">
                        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                            <div className="max-w-2xl">
                                <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">Built for clarity</p>
                                <h2 id="features-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Everything your team needs to stay in sync.
                                </h2>
                            </div>
                            <p className="text-muted-foreground max-w-md text-sm leading-6">
                                Bring your station portfolio and generation records into one straightforward workflow.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {features.map(({ icon: Icon, title, description, iconClass }, index) => (
                                <article
                                    key={title}
                                    className="group bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5 dark:hover:shadow-black/20"
                                >
                                    <span className="text-muted-foreground/50 absolute top-5 right-5 font-mono text-xs">
                                        0{index + 1}
                                    </span>
                                    <div className={`inline-flex rounded-xl p-3 transition group-hover:scale-105 ${iconClass}`}>
                                        <Icon className="size-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-5 font-semibold">{title}</h3>
                                    <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-400">
                    Power Management <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span> Station operations and meter readings
                </footer>
            </div>
        </>
    );
}
