import { type ZodSchema } from "zod";
import { badRequest, validationError } from "@/lib/api/responses";

export async function parseJson<T>(request: Request, schema: ZodSchema<T>) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch (error) {
    return { response: badRequest("Invalid JSON body.") } as const;
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { response: validationError(parsed.error) } as const;
  }
  return { data: parsed.data } as const;
}

export async function parseFormData<T>(request: Request, schema: ZodSchema<T>) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    return { response: badRequest("Invalid form data.") } as const;
  }

  const payload = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { response: validationError(parsed.error) } as const;
  }

  return { data: parsed.data, formData } as const;
}

export function parseQuery<T>(request: Request, schema: ZodSchema<T>) {
  const url = new URL(request.url);
  const payload = Object.fromEntries(url.searchParams.entries());
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { response: validationError(parsed.error) } as const;
  }
  return { data: parsed.data } as const;
}

export function parseHeaders<T>(request: Request, schema: ZodSchema<T>) {
  const payload: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    payload[key.toLowerCase()] = value;
  });

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { response: validationError(parsed.error) } as const;
  }
  return { data: parsed.data } as const;
}
