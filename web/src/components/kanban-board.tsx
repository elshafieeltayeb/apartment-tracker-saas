"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS_DE,
  type ApplicationStatusValue,
} from "@/lib/constants";

type AppRow = {
  id: string;
  title: string;
  listingUrl: string;
  sourcePlatform: string;
  status: string;
  nextFollowUpAt: string | null;
  coldRent: number | null;
  locationLabel: string | null;
};

export function KanbanBoard({ initial }: { initial: AppRow[] }) {
  const router = useRouter();
  const [apps, setApps] = useState(initial);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const m = new Map<string, AppRow[]>();
    for (const s of APPLICATION_STATUSES) m.set(s, []);
    const allowed = new Set<string>(APPLICATION_STATUSES);
    for (const a of apps) {
      const key = allowed.has(a.status) ? a.status : "interested";
      m.get(key)!.push(a);
    }
    return m;
  }, [apps]);

  async function updateStatus(id: string, status: ApplicationStatusValue) {
    setPendingId(id);
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setPendingId(null);
    if (!res.ok) return;
    const updated = await res.json();
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, ...updated } : a)));
    router.refresh();
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {APPLICATION_STATUSES.map((status) => (
        <section
          key={status}
          className="flex w-72 shrink-0 flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
        >
          <h2 className="border-b border-[var(--card-border)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {STATUS_LABELS_DE[status]}
            <span className="ml-1 font-normal text-[var(--muted)]">
              ({byStatus.get(status)?.length ?? 0})
            </span>
          </h2>
          <ul className="flex max-h-[min(70vh,720px)] flex-col gap-2 overflow-y-auto p-2">
            {(byStatus.get(status) ?? []).map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 text-sm shadow-sm"
              >
                <Link
                  href={`/dashboard/applications/${a.id}`}
                  className="font-medium leading-snug text-[var(--foreground)] hover:text-[var(--accent)]"
                >
                  {a.title}
                </Link>
                <p className="mt-1 line-clamp-1 text-xs text-[var(--muted)]">
                  {a.locationLabel || a.sourcePlatform}
                </p>
                {a.coldRent != null && (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {a.coldRent} € kalt
                  </p>
                )}
                <div className="mt-2">
                  <label className="sr-only" htmlFor={`st-${a.id}`}>
                    Status
                  </label>
                  <select
                    id={`st-${a.id}`}
                    disabled={pendingId === a.id}
                    value={a.status}
                    onChange={(e) =>
                      updateStatus(a.id, e.target.value as ApplicationStatusValue)
                    }
                    className="w-full rounded-md border border-[var(--card-border)] bg-[var(--card)] px-2 py-1 text-xs"
                  >
                    {APPLICATION_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS_DE[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
