"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConversation,
  getAuthConfig,
  getConversation,
  getConversations,
  getDashboard,
  getMe,
  getProjects,
  getWorkspace,
  logout,
  sendMessage,
  switchUser,
  updateDashboard,
  updateProductIntegrations,
} from "@/lib/client/api";
import type { DashboardConfigDTO } from "@/lib/schemas";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: getMe });
}

export function useAuthConfig() {
  return useQuery({ queryKey: ["auth-config"], queryFn: getAuthConfig });
}

export function useSwitchUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: switchUser,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: getProjects });
}

export function useWorkspace(projectSlug: string) {
  return useQuery({ queryKey: ["workspace", projectSlug], queryFn: () => getWorkspace(projectSlug) });
}

export function useConversations(projectSlug: string) {
  return useQuery({ queryKey: ["conversations", projectSlug], queryFn: () => getConversations(projectSlug) });
}

export function useConversation(projectSlug: string, conversationId: string) {
  return useQuery({
    queryKey: ["conversation", projectSlug, conversationId],
    queryFn: () => getConversation(projectSlug, conversationId),
    enabled: Boolean(conversationId),
  });
}

export function useCreateConversation(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productInstanceId: string) => createConversation(projectSlug, productInstanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", projectSlug] });
    },
  });
}

export function useSendMessage(projectSlug: string, conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productInstanceId: string; content: string }) =>
      sendMessage(projectSlug, conversationId, input.productInstanceId, input.content),
    onSuccess: (data) => {
      queryClient.setQueryData(["conversation", projectSlug, conversationId], data);
      queryClient.invalidateQueries({ queryKey: ["conversations", projectSlug] });
    },
  });
}

export function useUpdateProductIntegrations(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productInstanceId: string; integrations: { shopify: boolean; crm: boolean } }) =>
      updateProductIntegrations(projectSlug, input.productInstanceId, input.integrations),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace", projectSlug] });
    },
  });
}

export function useDashboard(projectSlug: string) {
  return useQuery({ queryKey: ["dashboard", projectSlug], queryFn: () => getDashboard(projectSlug), retry: false });
}

export function useUpdateDashboard(projectSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dashboard: Pick<DashboardConfigDTO, "title" | "subtitle" | "sections">) => updateDashboard(projectSlug, dashboard),
    onSuccess: (data) => {
      queryClient.setQueryData(["dashboard", projectSlug], data);
    },
  });
}
