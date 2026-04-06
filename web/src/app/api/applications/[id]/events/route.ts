import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { logApplicationEvent } from "@/lib/events";

const bodySchema = z.object({
  type: z.string().min(1).max(64),
  payload: z.record(z.string(), z.unknown()).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const app = await prisma.application.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await logApplicationEvent(
    id,
    parsed.data.type,
    parsed.data.payload ?? {},
  );
  const events = await prisma.applicationEvent.findMany({
    where: { applicationId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(events);
}
