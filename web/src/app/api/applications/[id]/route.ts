import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { applicationPatchSchema } from "@/lib/validation";
import { logApplicationEvent } from "@/lib/events";

type Params = { params: Promise<{ id: string }> };

async function getOwnedApplication(userId: string, id: string) {
  return prisma.application.findFirst({
    where: { id, userId },
    include: { events: { orderBy: { createdAt: "desc" }, take: 50 } },
  });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const app = await getOwnedApplication(session.user.id, id);
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = applicationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;
  if (data.status && data.status !== existing.status) {
    await logApplicationEvent(id, "status_change", {
      from: existing.status,
      to: data.status,
    });
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      listingUrl: data.listingUrl ?? undefined,
      title: data.title ?? undefined,
      sourcePlatform: data.sourcePlatform ?? undefined,
      coldRent: data.coldRent !== undefined ? data.coldRent : undefined,
      utilities: data.utilities !== undefined ? data.utilities : undefined,
      rooms: data.rooms !== undefined ? data.rooms : undefined,
      locationLabel: data.locationLabel !== undefined ? data.locationLabel : undefined,
      appliedAt:
        data.appliedAt !== undefined
          ? data.appliedAt
            ? new Date(data.appliedAt)
            : null
          : undefined,
      channel: data.channel !== undefined ? data.channel : undefined,
      status: data.status ?? undefined,
      notes: data.notes !== undefined ? data.notes : undefined,
      nextFollowUpAt:
        data.nextFollowUpAt !== undefined
          ? data.nextFollowUpAt
            ? new Date(data.nextFollowUpAt)
            : null
          : undefined,
    },
  });

  if (Object.keys(data).length > 0 && !data.status) {
    await logApplicationEvent(id, "updated", { fields: Object.keys(data) });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
