import { Types } from "mongoose";
import { assertProjectAccess } from "@/lib/access";
import { connectToDatabase } from "@/lib/db";
import { ConversationModel, ProductInstanceModel, ProjectModel } from "@/lib/models";
import { serializeConversation, serializeProductInstance, serializeProject } from "@/lib/serializers";
import { buildIntegrationContext } from "@/lib/services/integrations";
import { generateAssistantReply } from "@/lib/services/ai";
import type { AccessUser } from "@/lib/access";
import type { ProductInstanceDoc, ProjectDoc } from "@/lib/models";

export async function listConversations(user: AccessUser | null, projectSlug: string) {
  await connectToDatabase();
  const project = await getAuthorizedProject(user, projectSlug);

  const conversations = await ConversationModel.find({ projectId: project._id }).sort({ updatedAt: -1 });
  return conversations.map(serializeConversation);
}

export async function createConversation(user: AccessUser | null, input: { projectSlug: string; productInstanceId: string; title?: string }) {
  await connectToDatabase();
  const project = await getAuthorizedProject(user, input.projectSlug);
  const productInstance = await getProjectProductInstance(project, input.productInstanceId);

  const conversation = await ConversationModel.create({
    projectId: project._id,
    productInstanceId: productInstance._id,
    title: input.title ?? "New sales assistant chat",
    messages: [
      {
        role: "assistant",
        content: `Ready to help with ${productInstance.name}. Ask about pipeline, commerce signals, or next actions.`,
        createdAt: new Date(),
      },
    ],
  });

  return serializeConversation(conversation);
}

export async function getConversation(user: AccessUser | null, projectSlug: string, conversationId: string) {
  await connectToDatabase();
  const project = await getAuthorizedProject(user, projectSlug);

  const conversation = await ConversationModel.findOne({ _id: conversationId, projectId: project._id });
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });
  return serializeConversation(conversation);
}

export async function sendMessage(
  user: AccessUser | null,
  input: { projectSlug: string; productInstanceId: string; conversationId: string; content: string },
) {
  await connectToDatabase();
  const project = await getAuthorizedProject(user, input.projectSlug);
  const productInstance = await getProjectProductInstance(project, input.productInstanceId);

  const conversation = await ConversationModel.findOne({
    _id: input.conversationId,
    projectId: project._id,
    productInstanceId: productInstance._id,
  });
  if (!conversation) throw Object.assign(new Error("Conversation not found"), { status: 404 });

  const integrationContext = buildIntegrationContext(serializeProductInstance(productInstance), input.content);
  const now = new Date();
  conversation.messages.push({ _id: new Types.ObjectId(), role: "user", content: input.content, createdAt: now });
  for (const step of integrationContext.stepLines) {
    conversation.messages.push({ _id: new Types.ObjectId(), role: "step", content: step, createdAt: new Date() });
  }

  const assistantContent = await generateAssistantReply({
    project: serializeProject(project),
    productInstance: serializeProductInstance(productInstance),
    messages: serializeConversation(conversation).messages,
    integrationFacts: integrationContext.facts,
    userMessage: input.content,
  });

  conversation.messages.push({ _id: new Types.ObjectId(), role: "assistant", content: assistantContent, createdAt: new Date() });
  if (conversation.title === "New sales assistant chat") {
    conversation.title = input.content.slice(0, 60);
  }
  await conversation.save();

  return serializeConversation(conversation);
}

async function getAuthorizedProject(user: AccessUser | null, projectSlug: string): Promise<ProjectDoc> {
  const project = await ProjectModel.findOne({ slug: projectSlug });
  if (!project) throw Object.assign(new Error("Project not found"), { status: 404 });
  assertProjectAccess(user, project._id.toString());
  return project;
}

async function getProjectProductInstance(project: ProjectDoc, productInstanceId: string): Promise<ProductInstanceDoc> {
  const productInstance = await ProductInstanceModel.findOne({ _id: productInstanceId, projectId: project._id });
  if (!productInstance) throw Object.assign(new Error("Product instance not found"), { status: 404 });
  return productInstance;
}
