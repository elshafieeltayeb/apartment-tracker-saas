import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateExtensionToken } from "@/lib/extension-token";
import { z } from "zod";

const postSchema = z.object({ name: z.string().max(120).optional() });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const devices = await prisma.device.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      tokenHint: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json(devices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { plain, digest } = generateExtensionToken();
  const device = await prisma.device.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name?.trim() || null,
      tokenHash: digest,
      tokenHint: plain.slice(-4),
    },
  });
  return NextResponse.json({
    id: device.id,
    token: plain,
    message:
      "Token nur dieses eine Mal sichtbar. In der Erweiterung unter API-Token speichern.",
  });
}
