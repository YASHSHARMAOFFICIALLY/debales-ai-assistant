import { projectSlugParamsSchema, updateDashboardConfigInputSchema } from "@/lib/schemas";
import { apiHandler } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth";
import { getDashboardConfig, updateDashboardConfig } from "@/lib/services/dashboard";

export async function GET(_: Request, context: { params: Promise<{ projectSlug: string }> }) {
  return apiHandler(async () => {
    const params = projectSlugParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    const dashboard = await getDashboardConfig(user, params.projectSlug);
    return { dashboard };
  });
}

export async function PATCH(request: Request, context: { params: Promise<{ projectSlug: string }> }) {
  return apiHandler(async () => {
    const params = projectSlugParamsSchema.parse(await context.params);
    const body = updateDashboardConfigInputSchema.parse({ ...(await request.json()), projectSlug: params.projectSlug });
    const user = await getCurrentUser();
    const dashboard = await updateDashboardConfig(user, body);
    return { dashboard };
  });
}
