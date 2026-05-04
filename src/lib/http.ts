import { NextResponse } from "next/server";
import { ZodError } from "zod";

export async function apiHandler<T>(handler: () => Promise<T>, init?: ResponseInit) {
  try {
    const data = await handler();
    return NextResponse.json(data, init);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
  }

  const maybeStatus = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  return NextResponse.json({ error: message }, { status: Number.isFinite(maybeStatus) ? maybeStatus : 500 });
}
