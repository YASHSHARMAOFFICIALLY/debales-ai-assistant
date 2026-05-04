import { AppShell } from "@/components/shell";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  return (
    <AppShell>
      <AdminDashboard projectSlug={projectSlug} />
    </AppShell>
  );
}
