"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import { useAuthConfig, useLogout, useMe, useSwitchUser } from "@/lib/client/hooks";
import { clsx } from "clsx";
import { useEffect } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = useMe();
  const authConfig = useAuthConfig();
  const switchUser = useSwitchUser();
  const logout = useLogout();
  const current = me.data?.user?.userId;
  const nextDemoUser = current === "demo-admin" ? "demo-member" : "demo-admin";

  useEffect(() => {
    if (!me.isLoading && !me.data?.user) {
      router.replace("/login");
    }
  }, [me.isLoading, me.data?.user, router]);

  if (me.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7]">
        <p className="text-sm text-neutral-500">Loading session...</p>
      </main>
    );
  }

  if (!me.data?.user) return null;

  return (
    <main className="min-h-screen bg-[#fbfaf7]" data-testid="app-shell">
      <header className="border-b border-line bg-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/projects" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
              <Bot size={20} />
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-wide text-moss">Debales AI</span>
              <span className="block text-lg font-semibold">Multi-tenant assistant</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2">
              <UserRound size={16} /> {me.data.user.name}
            </span>
            <button
              type="button"
              onClick={() => switchUser.mutate(nextDemoUser)}
              className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 hover:border-ink"
              title={`Switch to ${nextDemoUser}`}
            >
              <UserRound size={16} /> Switch to {nextDemoUser === "demo-admin" ? "Admin" : "Member"}
            </button>
            <button
              type="button"
              onClick={() => logout.mutate()}
              className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 hover:border-ink"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}

export function ProjectNav({ projectSlug, active }: { projectSlug: string; active: "chat" | "admin" }) {
  const itemClass = "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium";
  return (
    <nav className="flex flex-wrap gap-2" data-testid="project-nav">
      <Link
        href={`/projects/${projectSlug}`}
        className={clsx(itemClass, active === "chat" ? "bg-ink text-white" : "border border-line bg-white")}
      >
        <Bot size={16} /> Chat
      </Link>
      <Link
        href={`/projects/${projectSlug}/admin`}
        className={clsx(itemClass, active === "admin" ? "bg-ink text-white" : "border border-line bg-white")}
      >
        <Shield size={16} /> Admin
      </Link>
      <Link href="/projects" className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium">
        <LayoutDashboard size={16} /> Projects
      </Link>
    </nav>
  );
}
