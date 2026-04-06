import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Anmelden</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Wohnungs-Tracker — DE-Fokus
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Noch kein Konto?{" "}
          <Link href="/register" className="text-[var(--accent)] hover:underline">
            Registrieren
          </Link>
        </p>
        <p className="mt-4 text-center">
          <Link href="/" className="text-sm text-[var(--muted)] hover:underline">
            ← Startseite
          </Link>
        </p>
      </div>
    </div>
  );
}
