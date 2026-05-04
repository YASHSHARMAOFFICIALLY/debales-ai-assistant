import type { ConversationDoc, DashboardConfigDoc, ProductInstanceDoc, ProjectDoc, UserDoc } from "@/lib/models";
import { conversationSchema, dashboardConfigSchema, productInstanceSchema, projectSchema } from "@/lib/schemas";

export function serializeUser(doc: UserDoc) {
  return {
    userId: doc.userId,
    name: doc.name,
    email: doc.email,
    projectRoles: doc.projectRoles.map((entry) => ({
      projectId: entry.projectId.toString(),
      role: entry.role,
    })),
  };
}

export function serializeProject(doc: ProjectDoc) {
  return projectSchema.parse({
    _id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
  });
}

export function serializeProductInstance(doc: ProductInstanceDoc) {
  return productInstanceSchema.parse({
    _id: doc._id.toString(),
    projectId: doc.projectId.toString(),
    namespace: doc.namespace,
    name: doc.name,
    productType: doc.productType,
    integrations: doc.integrations,
    shellNav: doc.shellNav ?? [],
  });
}

export function serializeConversation(doc: ConversationDoc) {
  return conversationSchema.parse({
    _id: doc._id.toString(),
    projectId: doc.projectId.toString(),
    productInstanceId: doc.productInstanceId.toString(),
    title: doc.title,
    messages: doc.messages.map((message) => ({
      _id: message._id.toString(),
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
    updatedAt: doc.updatedAt.toISOString(),
  });
}

export function serializeDashboardConfig(doc: DashboardConfigDoc) {
  return dashboardConfigSchema.parse({
    _id: doc._id.toString(),
    projectId: doc.projectId.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    sections: doc.sections,
    updatedAt: doc.updatedAt.toISOString(),
  });
}
