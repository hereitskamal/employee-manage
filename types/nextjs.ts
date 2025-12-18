// types/nextjs.ts
import type { NextRequest } from "next/server";

/**
 * Next.js App Router route context parameter type
 * In Next.js 15+, params can be a Promise
 */
export type RouteContext = {
  params: Promise<{ [key: string]: string }> | { [key: string]: string };
};

/**
 * Utility function to resolve route params (handles both sync and async params)
 */
export async function resolveRouteParams(
  context: RouteContext | undefined
): Promise<{ [key: string]: string }> {
  if (!context?.params) {
    return {};
  }
  if (typeof (context.params as Promise<{ [key: string]: string }>).then === "function") {
    return await (context.params as Promise<{ [key: string]: string }>);
  }
  return context.params as { [key: string]: string };
}

/**
 * Type for Next.js API route handlers with dynamic segments
 */
export type RouteHandler<T extends { [key: string]: string } = { id: string }> = (
  req: NextRequest,
  context: RouteContext
) => Promise<Response>;

/**
 * Utility type for objects that may have either _id (MongoDB) or id (API response)
 */
export type WithId<T = Record<string, unknown>> = T & {
  _id?: string;
  id?: string;
};

/**
 * Utility function to extract ID from an object that may have _id or id
 */
export function getId(obj: WithId | null | undefined): string | undefined {
  if (!obj) return undefined;
  return (obj as { _id?: string; id?: string })._id ?? (obj as { _id?: string; id?: string }).id;
}

