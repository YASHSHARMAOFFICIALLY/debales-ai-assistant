import { AppShell } from "@/components/shell";
import { ChatWorkspace } from "@/components/chat-workspace";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params;
  return (
    <AppShell>
      <ChatWorkspace projectSlug={projectSlug} />
    </AppShell>
  );
}
