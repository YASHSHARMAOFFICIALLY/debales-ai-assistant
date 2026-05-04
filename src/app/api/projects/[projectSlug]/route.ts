import { projectSlugParamsSchema } from "@/lib/schemas";
import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { getProjectWorkspace } from "@/lib/services/projects";

export async function GET(_: Request, context: { params: Promise<{ projectSlug: string }> }) {
  return apiHandler(async () => {
    const params = projectSlugParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    return getProjectWorkspace(user, params.projectSlug);
  });
}
