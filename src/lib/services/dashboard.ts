import { assertAdminAccess } from "@/lib/access";
import { connectToDatabase } from "@/lib/db";
import { DashboardConfigModel, ProjectModel } from "@/lib/models";
import { serializeDashboardConfig } from "@/lib/serializers";
import type { AccessUser } from "@/lib/access";

export async function getDashboardConfig(user: AccessUser | null, projectSlug: string) {
  await connectToDatabase();
  const project = await ProjectModel.findOne({ slug: projectSlug });
  if (!project) throw Object.assign(new Error("Project not found"), { status: 404 });
  assertAdminAccess(user, project._id.toString());

  const config = await DashboardConfigModel.findOne({ projectId: project._id });
  if (!config) throw Object.assign(new Error("Dashboard config not found"), { status: 404 });
  return serializeDashboardConfig(config);
}

export async function updateDashboardConfig(
  user: AccessUser | null,
  input: { projectSlug: string; title: string; subtitle?: string; sections: unknown[] },
) {
  await connectToDatabase();
  const project = await ProjectModel.findOne({ slug: input.projectSlug });
  if (!project) throw Object.assign(new Error("Project not found"), { status: 404 });
  assertAdminAccess(user, project._id.toString());

  const config = await DashboardConfigModel.findOneAndUpdate(
    { projectId: project._id },
    {
      $set: {
        title: input.title,
        subtitle: input.subtitle,
        sections: input.sections,
      },
    },
    { new: true },
  );
  if (!config) throw Object.assign(new Error("Dashboard config not found"), { status: 404 });

  return serializeDashboardConfig(config);
}
