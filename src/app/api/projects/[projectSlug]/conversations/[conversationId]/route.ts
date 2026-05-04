import { conversationParamsSchema } from "@/lib/schemas";
import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { getConversation } from "@/lib/services/conversations";

export async function GET(_: Request, context: { params: Promise<{ projectSlug: string; conversationId: string }> }) {
  return apiHandler(async () => {
    const params = conversationParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    const conversation = await getConversation(user, params.projectSlug, params.conversationId);
    return { conversation };
  });
}
