import { AppShell } from "@/components/shell";
import { ChatWorkspace } from "@/components/chat-workspace";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ projectSlug: string; conversationId: string }> }) {
  const { projectSlug, conversationId } = await params;
  return (
    <AppShell>
      <ChatWorkspace projectSlug={projectSlug} conversationId={conversationId} />
    </AppShell>
  );
}
