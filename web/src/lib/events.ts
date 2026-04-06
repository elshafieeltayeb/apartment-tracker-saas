import { prisma } from "@/lib/prisma";

export async function logApplicationEvent(
  applicationId: string,
  type: string,
  payload?: Record<string, unknown>,
) {
  await prisma.applicationEvent.create({
    data: {
      applicationId,
      type,
      payload: payload ? JSON.stringify(payload) : null,
    },
  });
}
