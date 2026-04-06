"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SettingsForm({
  initial,
}: {
  initial: { name: string; locale: "de" | "en"; timezone: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [locale, setLocale] = useState<"de" | "en">(initial.locale);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setPending(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, locale, timezone }),
    });
    setPending(false);
    if (!res.ok) {
      setErr("Speichern fehlgeschlagen.");
      return;
    }
    setMsg("Gespeichert.");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h2 className="text-lg font-semibold">Profil</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Sprache</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "de" | "en")}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              <option value="de">Deutsch</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Zeitzone</label>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        {err && <p className="text-sm text-red-500">{err}</p>}
        {msg && <p className="text-sm text-green-600 dark:text-green-400">{msg}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          Speichern
        </button>
      </form>
    </section>
  );
}
