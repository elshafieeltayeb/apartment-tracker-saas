import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canCreateApplication } from "@/lib/plan";
import { applicationCreateSchema } from "@/lib/validation";
import { logApplicationEvent } from "@/lib/events";
import { getDeviceUserIdFromBearer } from "@/lib/extension-token";

export async function GET(req: Request) {
  const userId = await getDeviceUserIdFromBearer(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const apps = await prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(apps);
}

export async function POST(req: Request) {
  const userId = await getDeviceUserIdFromBearer(req.headers.get("authorization"));
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = applicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const gate = await canCreateApplication(userId);
  const existing = await prisma.application.findFirst({
    where: { userId, listingUrl: data.listingUrl },
  });
  if (!existing && !gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 403 });
  }

  const appliedAt = data.appliedAt ? new Date(data.appliedAt) : null;
  const nextFollowUpAt = data.nextFollowUpAt
    ? new Date(data.nextFollowUpAt)
    : null;

  if (existing) {
    const updated = await prisma.application.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        sourcePlatform: data.sourcePlatform ?? existing.sourcePlatform,
        coldRent: data.coldRent ?? undefined,
        utilities: data.utilities ?? undefined,
        rooms: data.rooms ?? undefined,
        locationLabel: data.locationLabel ?? undefined,
        appliedAt: appliedAt ?? undefined,
        channel: data.channel ?? undefined,
        status: data.status ?? undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        nextFollowUpAt: nextFollowUpAt ?? undefined,
      },
    });
    await logApplicationEvent(updated.id, "updated", { source: "extension" });
    return NextResponse.json(updated);
  }

  const created = await prisma.application.create({
    data: {
      userId,
      listingUrl: data.listingUrl,
      title: data.title,
      sourcePlatform: data.sourcePlatform ?? "other",
      coldRent: data.coldRent ?? null,
      utilities: data.utilities ?? null,
      rooms: data.rooms ?? null,
      locationLabel: data.locationLabel ?? null,
      appliedAt,
      channel: data.channel ?? null,
      status: data.status ?? "interested",
      notes: data.notes ?? null,
      nextFollowUpAt,
    },
  });
  await logApplicationEvent(created.id, "created", { source: "extension" });
  return NextResponse.json(created, { status: 201 });
}
