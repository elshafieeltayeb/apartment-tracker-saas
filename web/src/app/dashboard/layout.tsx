import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-56 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)] p-4 md:block">
        <Link
          href="/dashboard"
          className="block px-3 text-sm font-semibold tracking-tight"
        >
          Wohnungs-Tracker
        </Link>
        <div className="mt-6">
          <DashboardNav />
        </div>
        <div className="mt-8 border-t border-[var(--card-border)] pt-4">
          <p className="truncate px-3 text-xs text-[var(--muted)]">
            {session.user.email}
          </p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-[var(--card-border)] bg-[var(--card)] px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/dashboard" className="text-sm font-semibold">
              Dashboard
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/new"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              + Bewerbung
            </Link>
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>
        <div className="md:hidden border-b border-[var(--card-border)] bg-[var(--card)] px-2 py-2">
          <DashboardNav />
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
