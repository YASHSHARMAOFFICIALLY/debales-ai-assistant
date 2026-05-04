import type { Role } from "@/lib/schemas";

export type ProjectRole = {
  projectId: string;
  role: Role;
};

export type AccessUser = {
  userId: string;
  projectRoles: ProjectRole[];
};

export function getProjectRole(user: AccessUser | null, projectId: string) {
  return user?.projectRoles.find((entry) => entry.projectId === projectId)?.role ?? null;
}

export function canOpenProject(user: AccessUser | null, projectId: string) {
  return Boolean(getProjectRole(user, projectId));
}

export function canOpenAdminDashboard(user: AccessUser | null, projectId: string) {
  return getProjectRole(user, projectId) === "admin";
}

export function assertProjectAccess(user: AccessUser | null, projectId: string) {
  if (!canOpenProject(user, projectId)) {
    throw Object.assign(new Error("Project access denied"), { status: 403 });
  }
}

export function assertAdminAccess(user: AccessUser | null, projectId: string) {
  if (!canOpenAdminDashboard(user, projectId)) {
    throw Object.assign(new Error("Admin access denied"), { status: 403 });
  }
}
