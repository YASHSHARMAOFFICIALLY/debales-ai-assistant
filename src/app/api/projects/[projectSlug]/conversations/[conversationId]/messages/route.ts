import { conversationParamsSchema, sendMessageInputSchema } from "@/lib/schemas";
import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { sendMessage } from "@/lib/services/conversations";

export async function POST(request: Request, context: { params: Promise<{ projectSlug: string; conversationId: string }> }) {
  return apiHandler(async () => {
    const params = conversationParamsSchema.parse(await context.params);
    const body = sendMessageInputSchema.parse({
      ...(await request.json()),
      projectSlug: params.projectSlug,
      conversationId: params.conversationId,
    });
    const user = await getCurrentUser();
    const conversation = await sendMessage(user, body);
    return { conversation };
  });
}
