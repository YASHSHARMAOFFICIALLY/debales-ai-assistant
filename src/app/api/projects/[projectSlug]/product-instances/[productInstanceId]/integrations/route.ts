import { apiHandler } from "@/lib/http";
import { productInstanceParamsSchema, updateProductIntegrationsInputSchema } from "@/lib/schemas";
import { getCurrentUser } from "@/lib/services/auth";
import { updateProductIntegrations } from "@/lib/services/projects";

export async function PATCH(request: Request, context: { params: Promise<{ projectSlug: string; productInstanceId: string }> }) {
  return apiHandler(async () => {
    const params = productInstanceParamsSchema.parse(await context.params);
    const body = updateProductIntegrationsInputSchema.parse({
      ...(await request.json()),
      projectSlug: params.projectSlug,
      productInstanceId: params.productInstanceId,
    });
    const user = await getCurrentUser();
    const productInstance = await updateProductIntegrations(user, body);
    return { productInstance };
  });
}
