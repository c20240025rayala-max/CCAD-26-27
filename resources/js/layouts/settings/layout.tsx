import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        url: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        url: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        url: '/settings/appearance',
        icon: null,
    },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = window.location.pathname;

    return (
        <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
            <header className="dark:to-card rounded-2xl border bg-gradient-to-r from-emerald-50 to-white p-5 sm:p-7 dark:from-emerald-950/30">
                <p className="text-xs font-semibold tracking-[0.16em] text-emerald-700 uppercase dark:text-emerald-400">Account</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1 text-sm">Manage your profile, security, and appearance preferences.</p>
            </header>

            <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <aside>
                    <nav aria-label="Settings" className="bg-card grid grid-cols-3 gap-1 rounded-xl border p-1 shadow-sm lg:flex lg:flex-col">
                        {sidebarNavItems.map((item) => (
                            <Link
                                key={item.url}
                                href={item.url}
                                prefetch
                                className={cn(
                                    'rounded-lg px-3 py-2.5 text-center text-sm font-medium transition-colors lg:text-left',
                                    currentPath === item.url
                                        ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <div className="bg-card min-w-0 rounded-2xl border p-5 shadow-sm sm:p-7">
                    <section className="space-y-8">{children}</section>
                </div>
            </div>
        </main>
    );
}
