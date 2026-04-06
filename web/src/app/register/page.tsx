import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Registrieren</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Free-Plan: bis zu 20 aktive Bewerbungen
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Schon registriert?{" "}
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Anmelden
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
