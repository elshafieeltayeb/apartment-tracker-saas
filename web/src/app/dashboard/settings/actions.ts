"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  await prisma.user.delete({ where: { id: session.user.id } });
  await signOut({ redirect: false });
  redirect("/");
}
