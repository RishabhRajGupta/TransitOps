import { NextRequest } from "next/server";
import { z } from "zod";

export async function validateBody<T extends z.ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return schema.parseAsync(body);
}

export function validateParams<T extends z.ZodTypeAny>(
  params: any,
  schema: T
): z.infer<T> {
  return schema.parse(params);
}
