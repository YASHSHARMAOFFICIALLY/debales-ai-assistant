import { cookies } from "next/headers";
import { authCookies, createSessionToken, verifySessionToken } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/db";
import { ProjectModel, UserModel } from "@/lib/models";
import { serializeUser } from "@/lib/serializers";

export async function getCurrentUser() {
  await connectToDatabase();
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authCookies.session)?.value;
  const session = sessionToken ? verifySessionToken(sessionToken) : null;
  const userId = session?.sub ?? cookieStore.get("demoUserId")?.value ?? process.env.DEMO_USER_ID ?? "demo-admin";
  const user = await UserModel.findOne({ userId });
  return user ? serializeUser(user) : null;
}

export async function issueDemoSession(userId: "demo-admin" | "demo-member") {
  await connectToDatabase();
  const user = await UserModel.findOne({ userId });
  if (!user) {
    throw Object.assign(new Error("Demo user not found"), { status: 404 });
  }

  return createSessionToken({
    sub: user.userId,
    email: user.email,
    name: user.name,
    provider: "demo",
  });
}

export async function findOrCreateGoogleUser(profile: { googleId: string; email: string; name: string }) {
  await connectToDatabase();

  const existing = await UserModel.findOne({ email: profile.email });
  if (existing) {
    return existing;
  }

  const projectRoles = await getDefaultProjectRolesForGoogleUser(profile.email);
  return UserModel.create({
    userId: `google:${profile.googleId}`,
    name: profile.name,
    email: profile.email,
    projectRoles,
  });
}

export function createGoogleSession(user: { userId: string; email: string; name: string }) {
  return createSessionToken({
    sub: user.userId,
    email: user.email,
    name: user.name,
    provider: "google",
  });
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authCookies.sessionMaxAge,
  };
}

async function getDefaultProjectRolesForGoogleUser(email: string) {
  const allowedEmails = (process.env.GOOGLE_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length > 0 && !allowedEmails.includes(email.toLowerCase())) {
    return [];
  }

  const defaultProjectSlug = process.env.GOOGLE_DEFAULT_PROJECT_SLUG ?? "acme-retail";
  const defaultProject = await ProjectModel.findOne({ slug: defaultProjectSlug });
  return defaultProject ? [{ projectId: defaultProject._id, role: "member" as const }] : [];
}
