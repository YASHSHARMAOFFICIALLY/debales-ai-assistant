import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookies } from "@/lib/auth/jwt";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(authCookies.session);
  cookieStore.set("demoUserId", "logged-out", { path: "/", sameSite: "lax" });
  return NextResponse.json({ ok: true });
}
