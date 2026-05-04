import { describe, expect, it } from "vitest";
import { dashboardConfigSchema, productInstanceSchema } from "./schemas";

describe("schemas", () => {
  it("accepts supported dashboard widget config", () => {
    const parsed = dashboardConfigSchema.parse({
      _id: "dashboard-1",
      projectId: "project-1",
      title: "Admin",
      sections: [
        {
          id: "section-1",
          title: "Health",
          columns: 2,
          widgets: [
            { id: "metric-1", type: "metric", label: "Users", value: "42", tone: "moss" },
            { id: "list-1", type: "list", label: "Tasks", items: ["Follow up"] },
            { id: "status-1", type: "status", label: "CRM", status: "healthy", detail: "Enabled" },
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    });

    expect(parsed.sections[0].widgets).toHaveLength(3);
  });

  it("accepts config-driven product shell navigation", () => {
    const parsed = productInstanceSchema.parse({
      _id: "product-1",
      projectId: "project-1",
      namespace: "sales-assistant",
      name: "AI Sales Assistant",
      productType: "ai-sales-assistant",
      integrations: { shopify: true, crm: false },
      shellNav: [{ id: "chat", label: "Assistant", href: "/chat", enabled: true }],
    });

    expect(parsed.shellNav[0].label).toBe("Assistant");
  });
});
