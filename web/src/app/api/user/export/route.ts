import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const [user, applications, templates, devices] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        locale: true,
        timezone: true,
        createdAt: true,
        subscription: true,
      },
    }),
    prisma.application.findMany({
      where: { userId },
      include: { events: true },
    }),
    prisma.template.findMany({ where: { userId } }),
    prisma.device.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        tokenHint: true,
        lastSeenAt: true,
        createdAt: true,
      },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    user,
    applications,
    templates,
    devices,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="wohnungs-tracker-export-${userId.slice(0, 8)}.json"`,
    },
  });
}
