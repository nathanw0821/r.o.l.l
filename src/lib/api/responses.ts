import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "IMPORT_ERROR"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export type ApiErrorDetail = {
  path?: string;
  message: string;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: ApiErrorDetail[]
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && details.length > 0 ? { details } : {})
      }
    },
    { status }
  );
}

export function validationError(error: ZodError, message = "Validation failed") {
  const details = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message
  }));
  return fail(400, "VALIDATION_ERROR", message, details);
}

export function badRequest(message: string, details?: ApiErrorDetail[]) {
  return fail(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Unauthorized") {
  return fail(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden") {
  return fail(403, "FORBIDDEN", message);
}

export function notFound(message = "Not found") {
  return fail(404, "NOT_FOUND", message);
}

export function internalError(message = "Unexpected error") {
  return fail(500, "INTERNAL_ERROR", message);
}
