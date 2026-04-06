import Link from "next/link";
import { NewApplicationForm } from "./new-application-form";

export default function NewApplicationPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Pipeline
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Neue Bewerbung</h1>
      </div>
      <NewApplicationForm />
    </div>
  );
}
