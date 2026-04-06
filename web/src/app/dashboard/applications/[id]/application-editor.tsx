"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS_DE,
  type ApplicationStatusValue,
} from "@/lib/constants";

type EventRow = {
  id: string;
  type: string;
  payload: string | null;
  createdAt: string;
};

type AppPayload = {
  id: string;
  listingUrl: string;
  title: string;
  sourcePlatform: string;
  coldRent: number | null;
  utilities: number | null;
  rooms: number | null;
  locationLabel: string | null;
  appliedAt: string | null;
  channel: string | null;
  status: string;
  notes: string | null;
  nextFollowUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  events: EventRow[];
};

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function ApplicationEditor({ application: initial }: { application: AppPayload }) {
  const router = useRouter();
  const [app, setApp] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  async function save(partial: Record<string, unknown>) {
    setError(null);
    setPending(true);
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError("Speichern fehlgeschlagen.");
      return;
    }
    setApp((a) => ({ ...a, ...data, events: a.events }));
    router.refresh();
  }

  async function addTimelineNote() {
    if (!note.trim()) return;
    setPending(true);
    const res = await fetch(`/api/applications/${app.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "note", payload: { text: note.trim() } }),
    });
    const events = await res.json().catch(() => null);
    setPending(false);
    if (!res.ok || !Array.isArray(events)) {
      setError("Eintrag konnte nicht gespeichert werden.");
      return;
    }
    setNote("");
    setApp((a) => ({ ...a, events }));
    router.refresh();
  }

  async function remove() {
    if (!confirm("Diese Bewerbung wirklich löschen?")) return;
    const res = await fetch(`/api/applications/${app.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Inserats-URL</label>
          <div className="mt-1 flex flex-wrap gap-2">
            <input
              readOnly
              value={app.listingUrl}
              className="min-w-0 flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
            <Link
              href={app.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm hover:bg-[var(--card-border)]/30"
            >
              Öffnen
            </Link>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Titel</label>
          <input
            defaultValue={app.title}
            key={app.title}
            onBlur={(e) => {
              if (e.target.value !== app.title) save({ title: e.target.value });
            }}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={app.status}
              disabled={pending}
              onChange={(e) => {
                const status = e.target.value as ApplicationStatusValue;
                setApp((a) => ({ ...a, status }));
                save({ status });
              }}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS_DE[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Plattform</label>
            <input
              defaultValue={app.sourcePlatform}
              onBlur={(e) => {
                if (e.target.value !== app.sourcePlatform)
                  save({ sourcePlatform: e.target.value });
              }}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Kaltmiete</label>
            <input
              type="number"
              step="0.01"
              defaultValue={app.coldRent ?? ""}
              onBlur={(e) =>
                save({ coldRent: e.target.value ? Number(e.target.value) : null })
              }
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nebenkosten</label>
            <input
              type="number"
              step="0.01"
              defaultValue={app.utilities ?? ""}
              onBlur={(e) =>
                save({ utilities: e.target.value ? Number(e.target.value) : null })
              }
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Zimmer</label>
            <input
              type="number"
              step="0.1"
              defaultValue={app.rooms ?? ""}
              onBlur={(e) =>
                save({ rooms: e.target.value ? Number(e.target.value) : null })
              }
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Ort</label>
          <input
            defaultValue={app.locationLabel ?? ""}
            onBlur={(e) =>
              save({ locationLabel: e.target.value || null })
            }
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Beworben am</label>
            <input
              type="datetime-local"
              defaultValue={toLocalInput(app.appliedAt)}
              onBlur={(e) =>
                save({ appliedAt: fromLocalInput(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Nächstes Follow-up</label>
            <input
              type="datetime-local"
              defaultValue={toLocalInput(app.nextFollowUpAt)}
              onBlur={(e) =>
                save({ nextFollowUpAt: fromLocalInput(e.target.value) })
              }
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Kanal</label>
          <input
            defaultValue={app.channel ?? ""}
            onBlur={(e) => save({ channel: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Notizen</label>
          <textarea
            rows={5}
            defaultValue={app.notes ?? ""}
            onBlur={(e) => save({ notes: e.target.value || null })}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="button"
          onClick={remove}
          className="text-sm text-red-500 hover:underline"
        >
          Bewerbung löschen
        </button>
      </div>

      <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold">Aktivität</h2>
        <div className="mt-4 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notiz zur Timeline hinzufügen…"
            className="min-w-0 flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={pending}
            onClick={addTimelineNote}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            Speichern
          </button>
        </div>
        <ul className="mt-6 space-y-3 text-sm">
          {app.events.map((ev) => (
            <li
              key={ev.id}
              className="border-l-2 border-[var(--accent)]/40 pl-3"
            >
              <span className="font-medium text-[var(--foreground)]">
                {ev.type}
              </span>
              <span className="ml-2 text-xs text-[var(--muted)]">
                {new Date(ev.createdAt).toLocaleString("de-DE")}
              </span>
              {ev.payload && (
                <pre className="mt-1 whitespace-pre-wrap text-xs text-[var(--muted)]">
                  {ev.payload}
                </pre>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
