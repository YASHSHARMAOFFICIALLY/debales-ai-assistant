import { assertAdminAccess, assertProjectAccess } from "@/lib/access";
import { connectToDatabase } from "@/lib/db";
import { ProductInstanceModel, ProjectModel } from "@/lib/models";
import { serializeProductInstance, serializeProject } from "@/lib/serializers";
import type { AccessUser } from "@/lib/access";

export async function getProjectWorkspace(user: AccessUser | null, projectSlug: string) {
  await connectToDatabase();
  const project = await ProjectModel.findOne({ slug: projectSlug });
  if (!project) {
    throw Object.assign(new Error("Project not found"), { status: 404 });
  }
  assertProjectAccess(user, project._id.toString());
  const productInstances = await ProductInstanceModel.find({ projectId: project._id }).sort({ createdAt: 1 });
  return {
    project: serializeProject(project),
    productInstances: productInstances.map(serializeProductInstance),
  };
}

export async function listUserProjects(user: AccessUser | null) {
  await connectToDatabase();
  if (!user) {
    return [];
  }
  const ids = user.projectRoles.map((entry) => entry.projectId);
  const projects = await ProjectModel.find({ _id: { $in: ids } }).sort({ name: 1 });
  return projects.map(serializeProject);
}

export async function updateProductIntegrations(
  user: AccessUser | null,
  input: { projectSlug: string; productInstanceId: string; integrations: { shopify: boolean; crm: boolean } },
) {
  await connectToDatabase();
  const project = await ProjectModel.findOne({ slug: input.projectSlug });
  if (!project) {
    throw Object.assign(new Error("Project not found"), { status: 404 });
  }
  assertAdminAccess(user, project._id.toString());

  const productInstance = await ProductInstanceModel.findOneAndUpdate(
    { _id: input.productInstanceId, projectId: project._id },
    { $set: { integrations: input.integrations } },
    { new: true },
  );
  if (!productInstance) {
    throw Object.assign(new Error("Product instance not found"), { status: 404 });
  }

  return serializeProductInstance(productInstance);
}
