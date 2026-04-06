"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
    >
      Abmelden
    </button>
  );
}
