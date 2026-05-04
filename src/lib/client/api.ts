import type { ConversationDTO, DashboardConfigDTO, ProductInstanceDTO, ProjectDTO } from "@/lib/schemas";

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed");
  }
  return data;
}

export type CurrentUser = {
  userId: string;
  name: string;
  email: string;
  projectRoles: { projectId: string; role: "admin" | "member" }[];
};

export function getMe() {
  return requestJson<{ user: CurrentUser | null }>("/api/me");
}

export function switchUser(userId: "demo-admin" | "demo-member") {
  return requestJson<{ user: CurrentUser | null }>("/api/me", {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function logout() {
  return requestJson<{ ok: boolean }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getAuthConfig() {
  return requestJson<{ googleEnabled: boolean }>("/api/auth/config");
}

export function getProjects() {
  return requestJson<{ projects: ProjectDTO[] }>("/api/projects");
}

export function getWorkspace(projectSlug: string) {
  return requestJson<{ project: ProjectDTO; productInstances: ProductInstanceDTO[] }>(`/api/projects/${projectSlug}`);
}

export function getConversations(projectSlug: string) {
  return requestJson<{ conversations: ConversationDTO[] }>(`/api/projects/${projectSlug}/conversations`);
}

export function createConversation(projectSlug: string, productInstanceId: string) {
  return requestJson<{ conversation: ConversationDTO }>(`/api/projects/${projectSlug}/conversations`, {
    method: "POST",
    body: JSON.stringify({ productInstanceId }),
  });
}

export function getConversation(projectSlug: string, conversationId: string) {
  return requestJson<{ conversation: ConversationDTO }>(`/api/projects/${projectSlug}/conversations/${conversationId}`);
}

export function sendMessage(projectSlug: string, conversationId: string, productInstanceId: string, content: string) {
  return requestJson<{ conversation: ConversationDTO }>(`/api/projects/${projectSlug}/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ productInstanceId, content }),
  });
}

export function updateProductIntegrations(
  projectSlug: string,
  productInstanceId: string,
  integrations: { shopify: boolean; crm: boolean },
) {
  return requestJson<{ productInstance: ProductInstanceDTO }>(
    `/api/projects/${projectSlug}/product-instances/${productInstanceId}/integrations`,
    {
      method: "PATCH",
      body: JSON.stringify({ integrations }),
    },
  );
}

export function getDashboard(projectSlug: string) {
  return requestJson<{ dashboard: DashboardConfigDTO }>(`/api/projects/${projectSlug}/admin/dashboard`);
}

export function updateDashboard(projectSlug: string, dashboard: Pick<DashboardConfigDTO, "title" | "subtitle" | "sections">) {
  return requestJson<{ dashboard: DashboardConfigDTO }>(`/api/projects/${projectSlug}/admin/dashboard`, {
    method: "PATCH",
    body: JSON.stringify(dashboard),
  });
}
