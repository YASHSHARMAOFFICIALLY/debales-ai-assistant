import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authCookies } from "@/lib/auth/jwt";
import { exchangeGoogleCode } from "@/lib/auth/google";
import { createGoogleSession, findOrCreateGoogleUser, sessionCookieOptions } from "@/lib/services/auth";

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = callbackQuerySchema.parse({
    code: url.searchParams.get("code"),
    state: url.searchParams.get("state"),
  });

  const cookieStore = await cookies();
  const expectedState = cookieStore.get(authCookies.oauthState)?.value;
  if (!expectedState || expectedState !== query.state) {
    throw Object.assign(new Error("Invalid OAuth state"), { status: 401 });
  }

  const profile = await exchangeGoogleCode(query.code);
  const user = await findOrCreateGoogleUser(profile);
  const token = createGoogleSession(user);

  cookieStore.set(authCookies.session, token, sessionCookieOptions());
  cookieStore.delete(authCookies.oauthState);

  redirect("/");
}
