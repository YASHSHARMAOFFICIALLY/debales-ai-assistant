import type { ProductInstanceDTO } from "@/lib/schemas";

export type IntegrationContext = {
  stepLines: string[];
  facts: string[];
};

const commerceSignals = [
  { account: "BrightCart Co.", product: "Starter analytics bundle", cartValue: 1840, ageHours: 2, urgency: "high" },
  { account: "Luma Home", product: "Retention playbook", cartValue: 620, ageHours: 9, urgency: "medium" },
  { account: "Northstar Market", product: "Growth audit", cartValue: 4200, ageHours: 1, urgency: "critical" },
];

const crmSignals = [
  { account: "Northwind Supplies", owner: "Riya", stage: "Renewal risk", score: 91, nextStep: "Call before 4:30 PM" },
  { account: "Harbor Labs", owner: "Milan", stage: "Procurement review", score: 78, nextStep: "Send security answers" },
  { account: "Kite Retail", owner: "Asha", stage: "Expansion", score: 86, nextStep: "Share pricing options" },
];

export function buildIntegrationContext(productInstance: ProductInstanceDTO, userMessage = ""): IntegrationContext {
  const stepLines: string[] = ["Analyzing tenant context and conversation history."];
  const facts: string[] = [];
  const intent = classifyIntent(userMessage);

  if (productInstance.integrations.shopify) {
    const selected = commerceSignals.filter((signal) => intent === "commerce" || signal.urgency !== "medium");
    const revenue = selected.reduce((sum, signal) => sum + signal.cartValue, 0);
    const topCart = [...selected].sort((a, b) => b.cartValue - a.cartValue)[0];
    stepLines.push(`Reading Shopify-style commerce signals for ${selected.length} carts.`);
    facts.push(`Shopify mock data: ${selected.length} open carts worth $${revenue.toLocaleString()}.`);
    facts.push(
      `Highest-priority cart: ${topCart.account} has $${topCart.cartValue.toLocaleString()} in ${topCart.product} after ${topCart.ageHours}h.`,
    );
  } else {
    stepLines.push("Shopify integration is disabled for this product instance.");
  }

  if (productInstance.integrations.crm) {
    const selected = crmSignals.filter((signal) => intent === "crm" || signal.score >= 85);
    const hottestLead = [...selected].sort((a, b) => b.score - a.score)[0];
    stepLines.push(`Reading CRM-style pipeline signals for ${selected.length} priority accounts.`);
    facts.push(`CRM mock data: ${selected.length} priority accounts with scores from ${selected.map((signal) => signal.score).join(", ")}.`);
    facts.push(
      `Highest-priority CRM action: ${hottestLead.owner} should handle ${hottestLead.account} (${hottestLead.stage}) - ${hottestLead.nextStep}.`,
    );
  } else {
    stepLines.push("CRM integration is disabled for this product instance.");
  }

  return { stepLines, facts };
}

function classifyIntent(message: string) {
  const normalized = message.toLowerCase();
  if (["cart", "shopify", "commerce", "revenue", "checkout"].some((term) => normalized.includes(term))) {
    return "commerce";
  }
  if (["lead", "crm", "renewal", "pipeline", "follow"].some((term) => normalized.includes(term))) {
    return "crm";
  }
  return "mixed";
}
