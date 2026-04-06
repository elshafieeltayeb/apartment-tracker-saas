import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TemplatesManager } from "./templates-manager";
import { TEMPLATE_CATEGORIES } from "@/lib/constants";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Vorlagen</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Variablen:{" "}
          <code className="rounded bg-[var(--card-border)]/50 px-1">
            {"{{address}}"}
          </code>
          ,{" "}
          <code className="rounded bg-[var(--card-border)]/50 px-1">
            {"{{anzeige}}"}
          </code>
          ,{" "}
          <code className="rounded bg-[var(--card-border)]/50 px-1">
            {"{{name}}"}
          </code>
        </p>
      </div>
      <TemplatesManager
        initial={templates.map((t) => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }))}
        categories={TEMPLATE_CATEGORIES.map((c) => ({ ...c }))}
      />
    </div>
  );
}
