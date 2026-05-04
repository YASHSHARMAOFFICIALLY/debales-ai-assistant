import { AppShell } from "@/components/shell";
import { ProjectList } from "@/components/project-list";

export const dynamic = "force-dynamic";

export default function ProjectsPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            Select a tenant. Server-side route handlers enforce project membership and admin-only dashboard access.
          </p>
        </div>
        <ProjectList />
      </section>
    </AppShell>
  );
}
