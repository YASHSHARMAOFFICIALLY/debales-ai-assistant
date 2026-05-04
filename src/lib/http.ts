import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DatabaseConnectionError } from "@/lib/db";

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
    return NextResponse.json(
      { error: "Validation failed", code: "VALIDATION_FAILED", issues: error.issues },
      { status: 400 },
    );
  }

  if (error instanceof DatabaseConnectionError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        hint: "Verify MONGODB_URI in Vercel, MongoDB Atlas Database Access credentials, and Atlas Network Access.",
      },
      { status: error.status },
    );
  }

  const maybeStatus = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 500;
  const message = error instanceof Error ? error.message : "Unexpected error";
  const code = getErrorCode(error, maybeStatus);
  return NextResponse.json({ error: message, code }, { status: Number.isFinite(maybeStatus) ? maybeStatus : 500 });
}

function getErrorCode(error: unknown, status: number) {
  if (typeof error === "object" && error !== null && "code" in error && typeof error.code === "string") {
    return error.code;
  }

  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  return "INTERNAL_SERVER_ERROR";
}
