"use client";

import { useRouter } from "next/navigation";
import { Bot, LogIn, Shield, UserRound } from "lucide-react";
import { useAuthConfig, useMe, useSwitchUser } from "@/lib/client/hooks";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const me = useMe();
  const authConfig = useAuthConfig();
  const switchUser = useSwitchUser();

  useEffect(() => {
    if (me.data?.user) {
      router.replace("/");
    }
  }, [me.data?.user, router]);

  async function handleDemoLogin(userId: "demo-admin" | "demo-member") {
    await switchUser.mutateAsync(userId);
    router.push("/");
  }

  if (me.isLoading) return null;
  if (me.data?.user) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ink text-white">
            <Bot size={28} />
          </span>
          <h1 className="text-2xl font-semibold">Debales AI</h1>
          <p className="mt-1 text-sm text-neutral-500">Multi-tenant AI Assistant</p>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
          <p className="mb-4 text-center text-sm font-medium text-neutral-700">Sign in to continue</p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleDemoLogin("demo-admin")}
              disabled={switchUser.isPending}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-ink hover:bg-panel disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-moss/10 text-moss">
                <Shield size={18} />
              </span>
              <span className="text-left">
                <span className="block font-semibold">Demo Admin</span>
                <span className="block text-xs text-neutral-500">Full access with admin dashboard</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("demo-member")}
              disabled={switchUser.isPending}
              className="flex w-full items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-ink hover:bg-panel disabled:opacity-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-panel text-neutral-600">
                <UserRound size={18} />
              </span>
              <span className="text-left">
                <span className="block font-semibold">Demo Member</span>
                <span className="block text-xs text-neutral-500">Chat access, no admin dashboard</span>
              </span>
            </button>
          </div>

          {authConfig.data?.googleEnabled ? (
            <>
              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs text-neutral-400">or</span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <a
                href="/api/auth/google"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-3 text-sm font-medium transition hover:border-ink hover:bg-panel"
              >
                <LogIn size={16} /> Continue with Google
              </a>
            </>
          ) : null}
        </div>

        <p className="mt-5 text-center text-xs text-neutral-400">
          Server-enforced authorization. Demo users are seeded in MongoDB.
        </p>
      </div>
    </main>
  );
}
