import { createConversationInputSchema, projectSlugParamsSchema } from "@/lib/schemas";
import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { createConversation, listConversations } from "@/lib/services/conversations";

export async function GET(_: Request, context: { params: Promise<{ projectSlug: string }> }) {
  return apiHandler(async () => {
    const params = projectSlugParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    const conversations = await listConversations(user, params.projectSlug);
    return { conversations };
  });
}

export async function POST(request: Request, context: { params: Promise<{ projectSlug: string }> }) {
  return apiHandler(async () => {
    const params = projectSlugParamsSchema.parse(await context.params);
    const body = createConversationInputSchema.parse({ ...(await request.json()), projectSlug: params.projectSlug });
    const user = await getCurrentUser();
    const conversation = await createConversation(user, body);
    return { conversation };
  }, { status: 201 });
}
