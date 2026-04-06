import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { DevicesPanel } from "./devices-panel";
import { deleteAccount } from "./actions";
import { FREE_MAX_APPLICATIONS } from "@/lib/constants";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user, devices] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    }),
    prisma.device.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        tokenHint: true,
        lastSeenAt: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) return null;

  const origin =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Einstellungen</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Profil, Erweiterung, Datenexport (DSGVO) und Konto löschen.
        </p>
      </div>

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">Abo</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Aktuell:{" "}
          <strong className="text-[var(--foreground)]">
            {user.subscription?.plan === "pro" ? "Pro" : "Free"}
          </strong>
          {user.subscription?.plan !== "pro" && (
            <>
              {" "}
              — bis zu {FREE_MAX_APPLICATIONS} aktive Bewerbungen. Stripe / Pro
              folgt.
            </>
          )}
        </p>
      </section>

      <SettingsForm
        initial={{
          name: user.name ?? "",
          locale: user.locale === "en" ? "en" : "de",
          timezone: user.timezone,
        }}
      />

      <DevicesPanel
        initial={devices.map((d) => ({
          ...d,
          lastSeenAt: d.lastSeenAt?.toISOString() ?? null,
          createdAt: d.createdAt.toISOString(),
        }))}
        apiBaseUrl={`${origin}/api/extension`}
      />

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-lg font-semibold">Daten (DSGVO)</h2>
        <p className="text-sm text-[var(--muted)]">
          Export enthält Bewerbungen, Vorlagen und Metadaten zu verbundenen
          Geräten (keine vollen API-Tokens).
        </p>
        <a
          href="/api/user/export"
          className="inline-flex rounded-lg border border-[var(--card-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--card-border)]/30"
        >
          JSON exportieren
        </a>
      </section>

      <section className="rounded-xl border border-red-500/30 bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-red-500">Konto löschen</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Unwiderruflich inkl. aller Bewerbungen und Vorlagen.
        </p>
        <form action={deleteAccount} className="mt-4">
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Konto endgültig löschen
          </button>
        </form>
      </section>
    </div>
  );
}
