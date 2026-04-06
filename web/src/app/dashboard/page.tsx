import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban-board";
import { FREE_MAX_APPLICATIONS } from "@/lib/constants";
import { getUserPlan, countActiveApplications } from "@/lib/plan";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [apps, plan, activeCount] = await Promise.all([
    prisma.application.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    }),
    getUserPlan(session.user.id),
    countActiveApplications(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {plan === "pro" ? (
            "Pro — unbegrenzte aktive Bewerbungen."
          ) : (
            <>
              Free-Plan: {activeCount} / {FREE_MAX_APPLICATIONS} aktive
              Bewerbungen (Interessiert, Beworben, Besichtigung, Angebot, keine
              Antwort).
            </>
          )}
        </p>
      </div>
      <KanbanBoard
        initial={apps.map((a) => ({
          id: a.id,
          title: a.title,
          listingUrl: a.listingUrl,
          sourcePlatform: a.sourcePlatform,
          status: a.status,
          nextFollowUpAt: a.nextFollowUpAt?.toISOString() ?? null,
          coldRent: a.coldRent,
          locationLabel: a.locationLabel,
        }))}
      />
    </div>
  );
}
