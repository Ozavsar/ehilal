import qs from "qs";
import { notFound, unstable_rethrow } from "next/navigation";
import { env } from "@/config/env";

const DEFAULT_REVALIDATE = 60 * 60 * 24;

/** A failed Strapi request; `status` is undefined when Strapi couldn't be reached */
class ApiError extends Error {
  readonly status: number | undefined;
  readonly path: string;

  constructor(message: string, options: { path: string; status?: number; cause?: unknown }) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.path = options.path;
    this.status = options.status;
  }
}

// Strapi answers 404 for missing or unpublished single types
const isNotFoundError = (error: unknown) => error instanceof ApiError && error.status === 404;

/** Strapi 404 → notFound(); other failures propagate so ISR keeps serving the last good version */
export async function orNotFound<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isNotFoundError(error)) notFound();
    throw error;
  }
}

export function getStrapiURL(path = ""): string {
  return `${env.NEXT_PUBLIC_STRAPI_API_URL}${path}`;
}

export async function fetchAPI<T>(
  path: string,
  urlParamsObject = {},
  options: {
    headers?: Record<string, string>;
    cache?: RequestCache;
    tags?: string[];
    revalidate?: number;
  } = {},
): Promise<T> {
  // no-store plus a revalidate time is a conflict Next.js ignores: only cached requests get one
  const cache = options.cache ?? "force-cache";
  const mergedOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${env.BEARER_TOKEN}`,
    },
    cache,
    next: {
      tags: options.tags ?? [],
      ...(cache !== "no-store" && { revalidate: options.revalidate ?? DEFAULT_REVALIDATE }),
    },
  };

  const queryString = qs.stringify(urlParamsObject, { encode: false });
  const requestUrl = getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ""}`);

  let response: Response;
  try {
    response = await fetch(requestUrl, mergedOptions);
  } catch (error) {
    // Let Next.js handle its own control-flow errors (e.g. dynamic rendering bailouts)
    unstable_rethrow(error);
    throw new ApiError(`Strapi is unreachable: GET ${path}`, { path, cause: error });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(
      `Strapi request failed: GET ${path} → ${response.status} ${response.statusText} ${body.slice(0, 300)}`.trim(),
      { path, status: response.status },
    );
  }

  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new ApiError(`Strapi returned invalid JSON: GET ${path}`, {
      path,
      status: response.status,
      cause: error,
    });
  }
}
