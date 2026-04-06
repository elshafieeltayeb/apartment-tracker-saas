"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS_DE,
  type ApplicationStatusValue,
} from "@/lib/constants";

export function NewApplicationForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    listingUrl: "",
    title: "",
    sourcePlatform: "other",
    coldRent: "",
    utilities: "",
    rooms: "",
    locationLabel: "",
    channel: "",
    status: "interested" as ApplicationStatusValue,
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const payload = {
      listingUrl: form.listingUrl.trim(),
      title: form.title.trim(),
      sourcePlatform: form.sourcePlatform || "other",
      coldRent: form.coldRent ? Number(form.coldRent) : null,
      utilities: form.utilities ? Number(form.utilities) : null,
      rooms: form.rooms ? Number(form.rooms) : null,
      locationLabel: form.locationLabel.trim() || null,
      channel: form.channel.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Speichern fehlgeschlagen.");
      return;
    }
    router.push(`/dashboard/applications/${data.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
    >
      <div>
        <label className="text-sm font-medium">Inserats-URL *</label>
        <input
          required
          type="url"
          value={form.listingUrl}
          onChange={(e) => setForm((f) => ({ ...f, listingUrl: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Titel *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Plattform</label>
          <select
            value={form.sourcePlatform}
            onChange={(e) =>
              setForm((f) => ({ ...f, sourcePlatform: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            <option value="immoscout24">ImmoScout24</option>
            <option value="wggesucht">WG-Gesucht</option>
            <option value="kleinanzeigen">Kleinanzeigen</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                status: e.target.value as ApplicationStatusValue,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS_DE[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium">Kaltmiete (€)</label>
          <input
            type="number"
            step="0.01"
            value={form.coldRent}
            onChange={(e) => setForm((f) => ({ ...f, coldRent: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Nebenkosten (€)</label>
          <input
            type="number"
            step="0.01"
            value={form.utilities}
            onChange={(e) => setForm((f) => ({ ...f, utilities: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Zimmer</label>
          <input
            type="number"
            step="0.1"
            value={form.rooms}
            onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Ort / Stadtteil</label>
        <input
          value={form.locationLabel}
          onChange={(e) =>
            setForm((f) => ({ ...f, locationLabel: e.target.value }))
          }
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Kanal (E-Mail, Portal, …)</label>
        <input
          value={form.channel}
          onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Notizen</label>
        <textarea
          rows={4}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
      </div>
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
      >
        {pending ? "…" : "Speichern"}
      </button>
    </form>
  );
}
