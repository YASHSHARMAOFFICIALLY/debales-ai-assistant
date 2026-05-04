import { z } from "zod";

const googleTokenSchema = z.object({
  id_token: z.string(),
});

const googleProfileSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.union([z.literal("true"), z.literal(true)]),
  name: z.string().optional(),
  aud: z.string(),
});

export function getGoogleAuthUrl(state: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!clientId) {
    throw Object.assign(new Error("GOOGLE_CLIENT_ID is not configured"), { status: 400 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!clientId || !clientSecret) {
    throw Object.assign(new Error("Google OAuth credentials are not configured"), { status: 400 });
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw Object.assign(new Error("Google OAuth token exchange failed"), { status: 401 });
  }

  const token = googleTokenSchema.parse(await response.json());
  return verifyGoogleIdToken(token.id_token);
}

async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);

  if (!response.ok) {
    throw Object.assign(new Error("Google ID token verification failed"), { status: 401 });
  }

  const profile = googleProfileSchema.parse(await response.json());
  if (profile.aud !== clientId) {
    throw Object.assign(new Error("Google ID token audience mismatch"), { status: 401 });
  }

  return {
    googleId: profile.sub,
    email: profile.email,
    name: profile.name ?? profile.email,
  };
}
