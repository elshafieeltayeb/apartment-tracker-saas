"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type TemplateRow = {
  id: string;
  name: string;
  category: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function TemplatesManager({
  initial,
  categories,
}: {
  initial: TemplateRow[];
  categories: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?.id ?? "first_message");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, body }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError("Speichern fehlgeschlagen.");
      return;
    }
    setList((l) => [data, ...l]);
    setName("");
    setBody("");
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Vorlage löschen?")) return;
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setList((l) => l.filter((t) => t.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={create}
        className="space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
      >
        <h2 className="text-lg font-semibold">Neue Vorlage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Text</label>
          <textarea
            required
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-mono"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          Anlegen
        </button>
      </form>

      <ul className="space-y-4">
        {list.map((t) => (
          <li
            key={t.id}
            className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-[var(--muted)]">{t.category}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Löschen
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-sm text-[var(--muted)]">
              {t.body}
            </pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
