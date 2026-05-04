import { cookies } from "next/headers";
import { z } from "zod";
import { authCookies } from "@/lib/auth/jwt";
import { apiHandler } from "@/lib/http";
import { getCurrentUser, issueDemoSession, sessionCookieOptions } from "@/lib/services/auth";

const switchUserSchema = z.object({
  userId: z.enum(["demo-admin", "demo-member"]),
});

export async function GET() {
  return apiHandler(async () => {
    const user = await getCurrentUser();
    return { user };
  });
}

export async function POST(request: Request) {
  return apiHandler(async () => {
    const body = switchUserSchema.parse(await request.json());
    const cookieStore = await cookies();
    const token = await issueDemoSession(body.userId);
    cookieStore.set(authCookies.session, token, sessionCookieOptions());
    cookieStore.set("demoUserId", body.userId, { path: "/", sameSite: "lax" });
    const user = await getCurrentUser();
    return { user };
  });
}
