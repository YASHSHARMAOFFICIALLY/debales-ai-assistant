import "dotenv/config";
import mongoose from "mongoose";
import { ConversationModel, DashboardConfigModel, ProductInstanceModel, ProjectModel, UserModel } from "../src/lib/models";

async function main() {
  const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/debales_ai_assignment";
  await mongoose.connect(uri);

  await Promise.all([
    ProjectModel.deleteMany({}),
    UserModel.deleteMany({}),
    ProductInstanceModel.deleteMany({}),
    ConversationModel.deleteMany({}),
    DashboardConfigModel.deleteMany({}),
  ]);

  const acme = await ProjectModel.create({
    name: "Acme Retail",
    slug: "acme-retail",
    description: "A commerce tenant using the AI Sales Assistant product.",
  });

  const orbit = await ProjectModel.create({
    name: "Orbit Services",
    slug: "orbit-services",
    description: "A B2B services tenant with CRM-only signals.",
  });

  const acmeAssistant = await ProductInstanceModel.create({
    projectId: acme._id,
    namespace: "sales-assistant",
    name: "AI Sales Assistant",
    productType: "ai-sales-assistant",
    integrations: { shopify: true, crm: true },
    shellNav: [
      { id: "chat", label: "Assistant", href: "/chat", enabled: true },
      { id: "admin", label: "Admin config", href: "/admin", enabled: true },
      { id: "insights", label: "Insights", href: "/admin#insights", enabled: true },
    ],
  });

  await ProductInstanceModel.create({
    projectId: orbit._id,
    namespace: "sales-assistant",
    name: "AI Sales Assistant",
    productType: "ai-sales-assistant",
    integrations: { shopify: false, crm: true },
    shellNav: [
      { id: "chat", label: "Assistant", href: "/chat", enabled: true },
      { id: "admin", label: "Admin config", href: "/admin", enabled: true },
      { id: "commerce", label: "Commerce", href: "/admin#commerce", enabled: false },
    ],
  });

  await ConversationModel.create({
    projectId: acme._id,
    productInstanceId: acmeAssistant._id,
    title: "Welcome workflow",
    messages: [
      {
        role: "assistant",
        content: "Ready to help Acme Retail turn commerce and CRM signals into next actions.",
        createdAt: new Date(),
      },
    ],
  });

  await UserModel.create([
    {
      userId: "demo-admin",
      name: "Asha Admin",
      email: "asha.admin@example.com",
      projectRoles: [
        { projectId: acme._id, role: "admin" },
        { projectId: orbit._id, role: "member" },
      ],
    },
    {
      userId: "demo-member",
      name: "Milan Member",
      email: "milan.member@example.com",
      projectRoles: [{ projectId: acme._id, role: "member" }],
    },
  ]);

  await DashboardConfigModel.create({
    projectId: acme._id,
    title: "Acme Retail Admin Console",
    subtitle: "This entire dashboard body is rendered from the dashboardconfigs collection.",
    sections: [
      {
        id: "health",
        title: "Tenant Health",
        description: "Operational signals for the Acme product instance.",
        columns: 3,
        widgets: [
          { id: "active-users", type: "metric", label: "Active users", value: "42", helper: "+8 this week", tone: "moss" },
          { id: "ai-resolution", type: "metric", label: "AI resolution", value: "71%", helper: "Fallback included", tone: "gold" },
          { id: "risk", type: "status", label: "Commerce sync", status: "healthy", detail: "Shopify-style mock sync enabled" },
        ],
      },
      {
        id: "insights",
        title: "Admin Insights",
        description: "Edit this section in MongoDB to reorder or replace widgets without code changes.",
        columns: 2,
        widgets: [
          { id: "priority", type: "list", label: "Priority actions", items: ["Call hot leads before 5 PM", "Recover abandoned carts over $500", "Review CRM renewal risk"] },
          { id: "crm", type: "status", label: "CRM pipeline", status: "attention", detail: "9 high-intent leads need owner assignment" },
        ],
      },
    ],
  });

  await DashboardConfigModel.create({
    projectId: orbit._id,
    title: "Orbit Services Admin Console",
    subtitle: "Only admins can see this; demo-admin is a member here, so access is denied.",
    sections: [
      {
        id: "orbit-health",
        title: "Service Pipeline",
        columns: 2,
        widgets: [
          { id: "crm-status", type: "status", label: "CRM", status: "healthy", detail: "CRM integration enabled" },
          { id: "shopify-status", type: "status", label: "Commerce", status: "paused", detail: "Shopify integration disabled" },
        ],
      },
    ],
  });

  console.log("Seed complete");
  console.log("Admin user: demo-admin");
  console.log("Member user: demo-member");
  console.log("Project slugs: acme-retail, orbit-services");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
