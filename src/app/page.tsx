import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fbfaf7] px-5">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-white shadow-soft">
          <Bot size={32} />
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">Debales AI</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-neutral-500">
          Multi-tenant AI assistant with project-scoped chat, integration toggles, and a config-driven admin dashboard.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-medium text-white transition hover:bg-ink/90"
          >
            Get Started <ArrowRight size={16} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-6 py-3 text-sm font-medium transition hover:border-ink"
          >
            Demo Login
          </Link>
        </div>

        <p className="mt-10 text-xs text-neutral-400">
          Next.js &middot; React &middot; TypeScript &middot; MongoDB &middot; TanStack Query &middot; Zod
        </p>
      </div>
    </main>
  );
}
