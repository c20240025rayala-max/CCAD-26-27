import AppLogo from '@/components/app-logo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ArrowRight, BarChart3, Factory, Zap } from 'lucide-react';

const features = [
    {
        icon: Factory,
        title: 'Station management',
        description: 'Keep station capacity, operators, and grid assignments organized.',
    },
    {
        icon: Activity,
        title: 'Meter readings',
        description: 'Record generated energy, peak output, and tariff details.',
    },
    {
        icon: BarChart3,
        title: 'Operational insights',
        description: 'Review generation trends and identify unexpected output drops.',
    },
];

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-svh bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="inline-flex items-center gap-2">
                        <AppLogo />
                    </Link>
                    <nav aria-label="Main navigation" className="flex items-center gap-2">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                            >
                                Open dashboard <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-white dark:text-slate-200 dark:hover:bg-slate-900"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
                                >
                                    Create account
                                </Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="mx-auto w-full max-w-7xl space-y-14 px-4 pt-5 pb-14 sm:px-6 lg:px-8 lg:pt-10">
                    <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                        <div aria-hidden="true" className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full border-[48px] border-white/5" />
                        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-200">
                                    <Zap className="size-3.5" aria-hidden="true" />
                                    POWER OPERATIONS
                                </div>
                                <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                                    Make every reading <span className="text-emerald-300">count.</span>
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                                    A clear workspace for managing power stations, monitoring generation, and keeping meter records together.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Link
                                        href={auth.user ? route('dashboard') : route('register')}
                                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-300"
                                    >
                                        {auth.user ? 'Go to dashboard' : 'Get started'}
                                        <ArrowRight className="size-4" aria-hidden="true" />
                                    </Link>
                                    {!auth.user && (
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                                        >
                                            Log in
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur sm:p-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <p className="text-sm font-semibold">Your operations, in one place</p>
                                        <p className="mt-1 text-xs text-slate-400">A simple workflow from asset to insight</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-400/15 p-2.5 text-emerald-300">
                                        <Zap className="size-5" aria-hidden="true" />
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3">
                                    {[
                                        { number: '01', title: 'Manage stations', detail: 'Keep station and grid details current', icon: Factory },
                                        { number: '02', title: 'Record readings', detail: 'Capture generation and peak output', icon: Activity },
                                        { number: '03', title: 'Review performance', detail: 'Spot trends and flagged readings', icon: BarChart3 },
                                    ].map(({ number, title, detail, icon: Icon }) => (
                                        <div key={number} className="flex items-center gap-4 rounded-xl border border-white/5 bg-slate-950/30 p-4">
                                            <span className="font-mono text-xs font-semibold text-emerald-300">{number}</span>
                                            <div className="rounded-lg bg-white/10 p-2 text-slate-200">
                                                <Icon className="size-4" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium">{title}</p>
                                                <p className="mt-0.5 text-xs text-slate-400">{detail}</p>
                                            </div>
                                            <ArrowRight className="ml-auto size-4 shrink-0 text-slate-500" aria-hidden="true" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="mb-6 max-w-2xl">
                            <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-400">
                                Built for clarity
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Everything your team needs to stay in sync.</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {features.map(({ icon: Icon, title, description }) => (
                                <article
                                    key={title}
                                    className="bg-card rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    <div className="inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        <Icon className="size-5" aria-hidden="true" />
                                    </div>
                                    <h3 className="mt-5 font-semibold">{title}</h3>
                                    <p className="text-muted-foreground mt-2 text-sm leading-6">{description}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>
                <footer className="text-muted-foreground border-t bg-white/70 py-5 text-center text-xs dark:bg-slate-950/70">
                    Power Management · Station operations and meter readings
                </footer>
            </div>
        </>
    );
}
