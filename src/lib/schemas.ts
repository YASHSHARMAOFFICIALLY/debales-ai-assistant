import { z } from "zod";

export const roleSchema = z.enum(["admin", "member"]);
export const productTypeSchema = z.enum(["ai-sales-assistant"]);
export const integrationKeySchema = z.enum(["shopify", "crm"]);

export const mongoIdSchema = z.string().min(1);

export const userSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  projectRoles: z.array(
    z.object({
      projectId: mongoIdSchema,
      role: roleSchema,
    }),
  ),
});

export const projectSchema = z.object({
  _id: mongoIdSchema,
  name: z.string().min(1),
  slug: z.string().min(2),
  description: z.string(),
});

export const productInstanceSchema = z.object({
  _id: mongoIdSchema,
  projectId: mongoIdSchema,
  namespace: z.string().min(1),
  name: z.string().min(1),
  productType: productTypeSchema,
  integrations: z.object({
    shopify: z.boolean(),
    crm: z.boolean(),
  }),
  shellNav: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      href: z.string().min(1),
      enabled: z.boolean().default(true),
    }),
  ),
});

export const messageRoleSchema = z.enum(["user", "assistant", "step"]);

export const messageSchema = z.object({
  _id: mongoIdSchema.optional(),
  role: messageRoleSchema,
  content: z.string().min(1),
  createdAt: z.string(),
});

export const conversationSchema = z.object({
  _id: mongoIdSchema,
  projectId: mongoIdSchema,
  productInstanceId: mongoIdSchema,
  title: z.string().min(1),
  messages: z.array(messageSchema),
  updatedAt: z.string(),
});

export const createConversationInputSchema = z.object({
  projectSlug: z.string().min(2),
  productInstanceId: mongoIdSchema,
  title: z.string().min(1).max(80).optional(),
});

export const sendMessageInputSchema = z.object({
  projectSlug: z.string().min(2),
  productInstanceId: mongoIdSchema,
  conversationId: mongoIdSchema,
  content: z.string().min(1).max(2000),
});

export const updateProductIntegrationsInputSchema = z.object({
  projectSlug: z.string().min(2),
  productInstanceId: mongoIdSchema,
  integrations: z.object({
    shopify: z.boolean(),
    crm: z.boolean(),
  }),
});

export const projectSlugParamsSchema = z.object({
  projectSlug: z.string().min(2),
});

export const productInstanceParamsSchema = z.object({
  projectSlug: z.string().min(2),
  productInstanceId: mongoIdSchema,
});

export const conversationParamsSchema = z.object({
  projectSlug: z.string().min(2),
  conversationId: mongoIdSchema,
});

export const dashboardWidgetSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("metric"),
    id: z.string().min(1),
    label: z.string().min(1),
    value: z.string().min(1),
    helper: z.string().optional(),
    tone: z.enum(["moss", "tomato", "gold"]).default("moss"),
  }),
  z.object({
    type: z.literal("list"),
    id: z.string().min(1),
    label: z.string().min(1),
    items: z.array(z.string().min(1)),
  }),
  z.object({
    type: z.literal("status"),
    id: z.string().min(1),
    label: z.string().min(1),
    status: z.enum(["healthy", "attention", "paused"]),
    detail: z.string().min(1),
  }),
]);

export const dashboardSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  columns: z.number().int().min(1).max(3).default(2),
  widgets: z.array(dashboardWidgetSchema),
});

export const dashboardConfigSchema = z.object({
  _id: mongoIdSchema,
  projectId: mongoIdSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  sections: z.array(dashboardSectionSchema),
  updatedAt: z.string(),
});

export const updateDashboardConfigInputSchema = z.object({
  projectSlug: z.string().min(2),
  title: z.string().min(1).max(120),
  subtitle: z.string().max(240).optional(),
  sections: z.array(dashboardSectionSchema).min(1),
});

export type Role = z.infer<typeof roleSchema>;
export type IntegrationKey = z.infer<typeof integrationKeySchema>;
export type ProjectDTO = z.infer<typeof projectSchema>;
export type ProductInstanceDTO = z.infer<typeof productInstanceSchema>;
export type ConversationDTO = z.infer<typeof conversationSchema>;
export type MessageDTO = z.infer<typeof messageSchema>;
export type DashboardConfigDTO = z.infer<typeof dashboardConfigSchema>;
export type DashboardSectionDTO = z.infer<typeof dashboardSectionSchema>;
export type DashboardWidgetDTO = z.infer<typeof dashboardWidgetSchema>;
