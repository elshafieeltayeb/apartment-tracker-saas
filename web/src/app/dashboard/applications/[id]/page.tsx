import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationEditor } from "./application-editor";

type Props = { params: Promise<{ id: string }> };

export default async function ApplicationDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { id } = await params;
  const app = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
    include: { events: { orderBy: { createdAt: "desc" } } },
  });
  if (!app) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Pipeline
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{app.title}</h1>
      </div>
      <ApplicationEditor
        application={{
          ...app,
          appliedAt: app.appliedAt?.toISOString() ?? null,
          nextFollowUpAt: app.nextFollowUpAt?.toISOString() ?? null,
          createdAt: app.createdAt.toISOString(),
          updatedAt: app.updatedAt.toISOString(),
          events: app.events.map((e) => ({
            ...e,
            createdAt: e.createdAt.toISOString(),
          })),
        }}
      />
    </div>
  );
}
