import { getApiUrl } from "./env";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Transport-only: builds the URL and normalizes errors. Sets no caching or
 * revalidation policy — each call site owns that via `init`.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${getApiUrl()}${path}`;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed",
      0
    );
  }

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body && typeof body.error === "string") {
        message = body.error;
      }
    } catch {
      // Non-JSON error body: keep the HTTP <status> fallback.
    }
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}
