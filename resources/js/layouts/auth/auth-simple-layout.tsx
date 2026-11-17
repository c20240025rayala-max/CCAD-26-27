import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="via-background dark:via-background relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 to-slate-100 px-4 py-10 sm:px-6 dark:from-emerald-950/30 dark:to-slate-950">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-emerald-300/15 blur-3xl dark:bg-emerald-500/10"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -bottom-40 size-[28rem] rounded-full bg-blue-300/15 blur-3xl dark:bg-blue-500/10"
            />
            <main className="relative w-full max-w-md">
                <section className="bg-card rounded-3xl border p-6 shadow-xl shadow-slate-900/5 sm:p-8">
                    <Link
                        href={route('home')}
                        className="focus-visible:ring-ring mb-8 inline-flex rounded-lg focus-visible:ring-2 focus-visible:outline-none"
                    >
                        <AppLogo />
                    </Link>
                    <div className="mb-7 space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground text-sm leading-6">{description}</p>
                    </div>
                    {children}
                </section>
                <p className="text-muted-foreground mt-6 text-center text-xs">Power Management · Secure account access</p>
            </main>
        </div>
    );
}
