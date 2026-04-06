"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeviceRow = {
  id: string;
  name: string | null;
  tokenHint: string;
  lastSeenAt: string | null;
  createdAt: string;
};

export function DevicesPanel({
  initial,
  apiBaseUrl,
}: {
  initial: DeviceRow[];
  apiBaseUrl: string;
}) {
  const router = useRouter();
  const [devices, setDevices] = useState(initial);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function createDevice() {
    setPending(true);
    setNewToken(null);
    const res = await fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) return;
    const token = typeof data.token === "string" ? data.token : null;
    setNewToken(token);
    const label = name.trim() || null;
    setName("");
    setDevices((d) => [
      {
        id: data.id as string,
        name: label,
        tokenHint: token ? token.slice(-4) : "****",
        lastSeenAt: null,
        createdAt: new Date().toISOString(),
      },
      ...d,
    ]);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Gerät trennen?")) return;
    const res = await fetch(`/api/devices/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDevices((d) => d.filter((x) => x.id !== id));
      router.refresh();
    }
  }

  return (
    <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-lg font-semibold">Browser-Erweiterung</h2>
      <p className="text-sm text-[var(--muted)]">
        API-Basis:{" "}
        <code className="rounded bg-[var(--card-border)]/50 px-1 text-xs">
          {apiBaseUrl}
        </code>
        <br />
        In der Erweiterung unter Einstellungen dieselbe URL und den API-Token
        eintragen. Token wird nur einmal angezeigt.
      </p>

      {newToken && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          <strong>Neuer API-Token (kopieren):</strong>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all font-mono text-xs">
            {newToken}
          </pre>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Gerätename (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-[12rem] flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={pending}
          onClick={createDevice}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          Token erzeugen
        </button>
      </div>

      <ul className="space-y-2 text-sm">
        {devices.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2"
          >
            <span>
              {d.name || "Gerät"} ·{" "}
              <span className="text-[var(--muted)]">…{d.tokenHint}</span>
              {d.lastSeenAt && (
                <span className="ml-2 text-xs text-[var(--muted)]">
                  zuletzt {new Date(d.lastSeenAt).toLocaleString("de-DE")}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => remove(d.id)}
              className="text-red-500 hover:underline"
            >
              Entfernen
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
