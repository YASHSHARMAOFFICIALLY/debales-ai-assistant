import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const SESSION_COOKIE = "session";
const OAUTH_STATE_COOKIE = "oauth_state";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  provider: "demo" | "google";
  iat: number;
  exp: number;
};

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_JWT_SECRET is required in production");
  }
  return secret ?? "local-development-secret-change-me";
}

function sign(input: string) {
  return createHmac("sha256", getJwtSecret()).update(input).digest("base64url");
}

export function createSessionToken(input: Omit<SessionPayload, "iat" | "exp">) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    ...input,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = sign(`${header}.${body}`);
    const actual = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);

    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(body)) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createOAuthState() {
  return randomBytes(24).toString("base64url");
}

export const authCookies = {
  session: SESSION_COOKIE,
  oauthState: OAUTH_STATE_COOKIE,
  sessionMaxAge: SESSION_TTL_SECONDS,
};
