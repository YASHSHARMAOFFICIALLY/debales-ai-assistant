import type { MessageDTO, ProductInstanceDTO, ProjectDTO } from "@/lib/schemas";

type GenerateAssistantInput = {
  project: ProjectDTO;
  productInstance: ProductInstanceDTO;
  messages: MessageDTO[];
  integrationFacts: string[];
  userMessage: string;
};

export async function generateAssistantReply(input: GenerateAssistantInput) {
  const prompt = [
    `You are ${input.productInstance.name} for tenant ${input.project.name}.`,
    "Answer as a concise sales operations assistant. Use only the integration facts below when referencing business data.",
    `Integration facts: ${input.integrationFacts.length ? input.integrationFacts.join(" ") : "No integrations enabled."}`,
    `Recent conversation: ${input.messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n")}`,
    `User: ${input.userMessage}`,
  ].join("\n\n");

  if (process.env.AI_PROVIDER === "openrouter" && process.env.OPENROUTER_API_KEY) {
    return callOpenRouter(prompt);
  }

  if ((process.env.AI_PROVIDER === "gemini" || !process.env.AI_PROVIDER) && process.env.GEMINI_API_KEY) {
    return callGemini(prompt);
  }

  return fallbackReply(input);
}

async function callGemini(prompt: string) {
  const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
  });

  if (response.status === 429) {
    return "The AI provider is rate-limited right now. I used the tenant data, but please retry in a moment for a generated response.";
  }

  if (!response.ok) {
    return getAiProviderError("Gemini", response, await readProviderError(response));
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I could not extract a model response.";
}

async function callOpenRouter(prompt: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "google/gemini-2.0-flash-exp:free",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (response.status === 429) {
    return "The AI provider is rate-limited right now. I used the tenant data, but please retry in a moment for a generated response.";
  }

  if (!response.ok) {
    return getAiProviderError("OpenRouter", response, await readProviderError(response));
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "I could not extract a model response.";
}

async function readProviderError(response: Response) {
  try {
    const data = await response.json();
    const message = data?.error?.message ?? data?.message;
    return typeof message === "string" ? message : response.statusText;
  } catch {
    return response.statusText;
  }
}

function getAiProviderError(provider: string, response: Response, detail: string) {
  const advice =
    response.status === 400 || response.status === 403
      ? "Check the API key and whether the API is enabled for that provider project."
      : response.status === 404
        ? "Check the model name configured in GEMINI_MODEL or OPENROUTER_MODEL."
        : "Retry later or switch to the controlled fallback.";

  return `${provider} request failed with HTTP ${response.status}: ${detail} ${advice}`;
}

function fallbackReply(input: GenerateAssistantInput) {
  const enabled = Object.entries(input.productInstance.integrations)
    .filter(([, value]) => value)
    .map(([key]) => key)
    .join(", ");

  const dataLine = input.integrationFacts.length
    ? input.integrationFacts.join(" ")
    : "No integration data is enabled for this product instance.";

  return `Based on ${input.project.name}'s ${input.productInstance.name} setup, I would prioritize the highest-intent opportunities first. Enabled integrations: ${enabled || "none"}. ${dataLine} Recommended next step: ask the team owner to act on the hottest lead or cart signal, then log the outcome back into the enabled system.`;
}
