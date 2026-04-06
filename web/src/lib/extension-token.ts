import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function hashExtensionToken(plain: string) {
  return createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateExtensionToken() {
  const plain = randomBytes(32).toString("base64url");
  const digest = hashExtensionToken(plain);
  return { plain, digest };
}

export async function getDeviceUserIdFromBearer(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice(7).trim();
  if (!raw) return null;
  const digest = hashExtensionToken(raw);
  const device = await prisma.device.findFirst({
    where: { tokenHash: digest },
    select: { id: true, userId: true },
  });
  if (!device) return null;
  await prisma.device.update({
    where: { id: device.id },
    data: { lastSeenAt: new Date() },
  });
  return device.userId;
}
