import Link from "next/link";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <span className="text-sm font-semibold tracking-tight">
            Wohnungs-Tracker
          </span>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Zum Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Anmelden
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
                >
                  Registrieren
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-4 py-20">
        <p className="text-sm font-medium uppercase tracking-wider text-[var(--accent)]">
          Deutschland · Bewerbungen
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">
          Alle Wohnungsbewerbungen an einem Ort
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] text-pretty">
          Pipeline von Interesse bis Absage, Erinnerungen für Follow-ups und
          Textvorlagen für ImmoScout24, WG-Gesucht &amp; Co. — mit Browser-Erweiterung
          zum schnellen Speichern aus dem Tab.
        </p>
        <ul className="mt-8 list-inside list-disc space-y-2 text-[var(--foreground)]">
          <li>Kanban nach Status (interessiert → beworben → Besichtigung …)</li>
          <li>Lokale &amp; Cloud-Sync (Erweiterung + API-Token)</li>
          <li>Hell- und Dunkelmodus</li>
        </ul>
        {!session?.user && (
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Kostenlos starten
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-[var(--card-border)] px-5 py-2.5 text-sm font-medium hover:bg-[var(--card-border)]/30"
            >
              Ich habe schon ein Konto
            </Link>
          </div>
        )}
      </main>
      <footer className="border-t border-[var(--card-border)] py-6 text-center text-xs text-[var(--muted)]">
        MVP · Daten nach DSGVO exportierbar · siehe Einstellungen
      </footer>
    </div>
  );
}
