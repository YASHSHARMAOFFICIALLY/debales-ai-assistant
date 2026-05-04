import { describe, expect, it } from "vitest";
import { canOpenAdminDashboard, canOpenProject } from "./access";

const user = {
  userId: "demo-admin",
  projectRoles: [
    { projectId: "project-a", role: "admin" as const },
    { projectId: "project-b", role: "member" as const },
  ],
};

describe("access rules", () => {
  it("allows members and admins to open a project", () => {
    expect(canOpenProject(user, "project-a")).toBe(true);
    expect(canOpenProject(user, "project-b")).toBe(true);
  });

  it("allows only admins to open the admin dashboard", () => {
    expect(canOpenAdminDashboard(user, "project-a")).toBe(true);
    expect(canOpenAdminDashboard(user, "project-b")).toBe(false);
  });
});
