"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Loader2, MessageSquarePlus, Send, ShoppingBag, UserRound, UsersRound, Wrench } from "lucide-react";
import { ProjectNav } from "@/components/shell";
import {
  useMe,
  useConversation,
  useConversations,
  useCreateConversation,
  useSendMessage,
  useUpdateProductIntegrations,
  useWorkspace,
} from "@/lib/client/hooks";
import { clsx } from "clsx";
import type { MessageDTO } from "@/lib/schemas";

export function ChatWorkspace({ projectSlug, conversationId }: { projectSlug: string; conversationId?: string }) {
  const router = useRouter();
  const me = useMe();
  const workspace = useWorkspace(projectSlug);
  const conversations = useConversations(projectSlug);
  const createConversation = useCreateConversation(projectSlug);
  const updateIntegrations = useUpdateProductIntegrations(projectSlug);
  const selectedProduct = workspace.data?.productInstances[0];
  const selectedConversationId = conversationId ?? conversations.data?.conversations[0]?._id ?? "";
  const conversation = useConversation(projectSlug, selectedConversationId);
  const sendMessage = useSendMessage(projectSlug, selectedConversationId);
  const [draft, setDraft] = useState("");
  const [revealing, setRevealing] = useState<{ id: string; content: string; visible: string } | null>(null);

  const integrationBadges = useMemo(() => {
    if (!selectedProduct) return [];
    return [
      { key: "shopify", label: "Shopify-style", enabled: selectedProduct.integrations.shopify, icon: ShoppingBag },
      { key: "crm", label: "CRM-style", enabled: selectedProduct.integrations.crm, icon: UsersRound },
    ];
  }, [selectedProduct]);

  const isAdmin = useMemo(() => {
    const projectId = workspace.data?.project._id;
    return Boolean(projectId && me.data?.user?.projectRoles.some((entry) => entry.projectId === projectId && entry.role === "admin"));
  }, [me.data?.user?.projectRoles, workspace.data?.project._id]);

  const shellTabs = useMemo(() => {
    if (!selectedProduct) return [];
    return selectedProduct.shellNav.map((item) => ({
      ...item,
      resolvedHref: `/projects/${projectSlug}${item.href}`,
    }));
  }, [projectSlug, selectedProduct]);

  async function handleNewChat() {
    if (!selectedProduct) return;
    const result = await createConversation.mutateAsync(selectedProduct._id);
    router.push(`/projects/${projectSlug}/chat/${result.conversation._id}`);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || !selectedProduct || !selectedConversationId) return;
    const content = draft.trim();
    setDraft("");
    const result = await sendMessage.mutateAsync({ productInstanceId: selectedProduct._id, content });
    const lastAssistant = [...result.conversation.messages].reverse().find((message) => message.role === "assistant");
    if (lastAssistant?._id) {
      setRevealing({ id: lastAssistant._id, content: lastAssistant.content, visible: "" });
    }
  }

  async function handleIntegrationToggle(key: "shopify" | "crm") {
    if (!selectedProduct || !isAdmin) return;
    await updateIntegrations.mutateAsync({
      productInstanceId: selectedProduct._id,
      integrations: {
        ...selectedProduct.integrations,
        [key]: !selectedProduct.integrations[key],
      },
    });
  }

  useEffect(() => {
    if (!revealing || revealing.visible.length >= revealing.content.length) return;
    const timer = window.setTimeout(() => {
      setRevealing((current) => {
        if (!current) return current;
        const nextLength = Math.min(current.content.length, current.visible.length + 4);
        return { ...current, visible: current.content.slice(0, nextLength) };
      });
    }, 18);
    return () => window.clearTimeout(timer);
  }, [revealing]);

  if (workspace.isLoading || conversations.isLoading) {
    return <LoadingFrame label="Loading tenant workspace" />;
  }

  if (workspace.isError || conversations.isError) {
    const error = workspace.error ?? conversations.error;
    return (
      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="rounded-md border border-tomato/30 bg-tomato/10 p-4 text-sm text-tomato">{error?.message}</div>
      </section>
    );
  }

  const messages = conversation.data?.conversation.messages ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-6" data-testid="chat-workspace">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-moss">{workspace.data?.project.slug}</p>
          <h1 className="mt-1 text-3xl font-semibold">{workspace.data?.project.name}</h1>
          <p className="mt-2 text-sm text-neutral-600">{workspace.data?.project.description}</p>
        </div>
        <ProjectNav projectSlug={projectSlug} active="chat" />
      </div>

      <div className="grid gap-4 lg:min-h-[680px] lg:grid-cols-[300px_1fr]">
        <aside className="rounded-md border border-line bg-white">
          <div className="border-b border-line p-4">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-medium text-white"
              disabled={createConversation.isPending || !selectedProduct}
            >
              {createConversation.isPending ? <Loader2 className="animate-spin" size={16} /> : <MessageSquarePlus size={16} />} New chat
            </button>
          </div>
          <div className="space-y-2 p-3">
            {conversations.data?.conversations.length ? (
              conversations.data.conversations.map((item) => (
                <Link
                  key={item._id}
                  href={`/projects/${projectSlug}/chat/${item._id}`}
                  className={clsx(
                    "block rounded-md border px-3 py-3 text-sm",
                    selectedConversationId === item._id ? "border-ink bg-panel" : "border-transparent hover:border-line",
                  )}
                >
                  <span className="block font-medium">{item.title}</span>
                  <span className="mt-1 block text-xs text-neutral-500">{new Date(item.updatedAt).toLocaleString()}</span>
                </Link>
              ))
            ) : (
              <div className="rounded-md border border-line bg-panel p-4 text-sm text-neutral-600">No conversations yet.</div>
            )}
          </div>
        </aside>

        <div className="flex min-h-[560px] flex-col rounded-md border border-line bg-white lg:min-h-[680px]">
          <div className="border-b border-line p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedProduct?.name ?? "AI Sales Assistant"}</h2>
                <p className="text-sm text-neutral-600">Service-controlled AI flow with tenant-scoped conversations.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {integrationBadges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <button
                      key={badge.key}
                      type="button"
                      onClick={() => handleIntegrationToggle(badge.key as "shopify" | "crm")}
                      disabled={!isAdmin || updateIntegrations.isPending}
                      title={isAdmin ? `Toggle ${badge.label}` : "Only project admins can change integration toggles"}
                      className={clsx(
                        "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium transition",
                        badge.enabled ? "border-moss/30 bg-moss/10 text-moss" : "border-line bg-panel text-neutral-500",
                        isAdmin ? "hover:border-ink" : "cursor-not-allowed opacity-80",
                      )}
                    >
                      <Icon size={14} /> {badge.label}: {badge.enabled ? "on" : "off"}
                    </button>
                  );
                })}
                {isAdmin ? (
                  <span className="flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs text-neutral-500">
                    <Wrench size={14} /> Admin toggles
                  </span>
                ) : null}
              </div>
            </div>
            {shellTabs.length ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3" data-testid="config-driven-product-nav">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Product nav</span>
                {shellTabs.map((tab) => (
                  <Link
                    key={tab.id}
                    href={tab.enabled ? tab.resolvedHref : "#"}
                    aria-disabled={!tab.enabled}
                    className={clsx(
                      "rounded-md px-2 py-1 text-xs",
                      tab.enabled ? "text-neutral-700 hover:bg-panel" : "cursor-not-allowed text-neutral-400",
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4" data-testid="messages">
            {conversation.isLoading && selectedConversationId ? <LoadingFrame label="Loading conversation" compact /> : null}
            {!selectedConversationId ? (
              <div className="rounded-md border border-line bg-panel p-6 text-sm text-neutral-600">Create a chat to start asking questions.</div>
            ) : null}
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                content={message._id && revealing?.id === message._id ? revealing.visible : message.content}
                revealing={Boolean(revealing && message._id === revealing.id && revealing.visible.length < revealing.content.length)}
              />
            ))}
            {sendMessage.isPending ? (
              <div className="flex items-center gap-3 rounded-md border border-line bg-panel px-4 py-3 text-sm text-neutral-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-moss">
                  <Bot size={16} />
                </span>
                <Loader2 className="animate-spin" size={16} /> Assistant is analyzing integrations
              </div>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-line p-4">
            <div className="flex gap-2 sm:gap-3">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask about hot leads, carts, renewals, or next actions"
                className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-3 text-sm outline-none focus:border-ink sm:px-4"
                disabled={!selectedConversationId || sendMessage.isPending}
              />
              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-md bg-tomato text-white disabled:opacity-50"
                disabled={!draft.trim() || !selectedConversationId || sendMessage.isPending}
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message, content, revealing }: { message: MessageDTO; content: string; revealing: boolean }) {
  const isUser = message.role === "user";
  const isStep = message.role === "step";
  const Icon = isUser ? UserRound : isStep ? Wrench : Bot;

  return (
    <div className={clsx("flex gap-3", isUser && "justify-end")}>
      {!isUser ? (
        <span
          className={clsx(
            "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            isStep ? "border border-dashed border-line bg-white text-neutral-500" : "bg-moss/10 text-moss",
          )}
        >
          <Icon size={16} />
        </span>
      ) : null}
      <div className={clsx("max-w-3xl", isUser && "order-first")}>
        <div
          className={clsx(
            "rounded-md px-4 py-3 text-sm leading-6",
            isUser && "bg-ink text-white",
            message.role === "assistant" && "bg-panel text-ink",
            isStep && "border border-dashed border-line bg-white text-xs text-neutral-500",
          )}
        >
          {isStep ? <span className="font-medium uppercase tracking-wide">Step: </span> : null}
          <MarkdownText text={content || " "} />
          {revealing ? <span className="ml-1 inline-block h-4 w-1 translate-y-0.5 animate-pulse bg-current" /> : null}
        </div>
        <p className={clsx("mt-1 text-xs text-neutral-400", isUser && "text-right")}>{new Date(message.createdAt).toLocaleTimeString()}</p>
      </div>
      {isUser ? (
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-ink text-white">
          <Icon size={16} />
        </span>
      ) : null}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.every((line) => /^[-*]\s+/.test(line.trim()));
        if (isList) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-4">
              {lines.map((line) => (
                <li key={line}>{renderInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInlineMarkdown(block)}</p>;
      })}
    </div>
  );
}

function renderInlineMarkdown(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function LoadingFrame({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={clsx("mx-auto flex max-w-7xl items-center gap-2 px-5 text-sm text-neutral-600", compact ? "py-2" : "py-8")}>
      <Loader2 className="animate-spin" size={16} /> {label}
    </div>
  );
}
