import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authCookies, createOAuthState } from "@/lib/auth/jwt";
import { getGoogleAuthUrl } from "@/lib/auth/google";

export async function GET() {
  const state = createOAuthState();
  const cookieStore = await cookies();
  cookieStore.set(authCookies.oauthState, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  redirect(getGoogleAuthUrl(state));
}
