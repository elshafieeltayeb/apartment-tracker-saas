import { prisma } from "@/lib/prisma";
import { FREE_MAX_APPLICATIONS } from "@/lib/constants";

const ACTIVE_STATUSES = [
  "interested",
  "applied",
  "viewing",
  "offer",
  "ghosted",
];

export async function getUserPlan(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  return sub?.plan === "pro" ? "pro" : "free";
}

export async function countActiveApplications(userId: string) {
  return prisma.application.count({
    where: {
      userId,
      status: { in: ACTIVE_STATUSES },
    },
  });
}

export async function canCreateApplication(userId: string) {
  const plan = await getUserPlan(userId);
  if (plan === "pro") return { ok: true as const };
  const n = await countActiveApplications(userId);
  if (n >= FREE_MAX_APPLICATIONS) {
    return {
      ok: false as const,
      reason: `Free-Plan: max. ${FREE_MAX_APPLICATIONS} aktive Bewerbungen.`,
    };
  }
  return { ok: true as const };
}
