export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public isNetworkError = false,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      credentials: "same-origin",
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError(0, "ABORTED", "The request was aborted.");
    }
    throw new ApiClientError(0, "NETWORK_ERROR", "The server is unreachable. Check your connection.", true);
  }
  const text = await response.text();
  // Error pages from the platform or a proxy come back as HTML, not JSON —
  // treat unparseable bodies as an opaque failure instead of crashing callers.
  let body: Record<string, unknown> = {};
  if (text) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  if (!response.ok) {
    const error = (body?.error ?? {}) as { code?: string; message?: string };
    throw new ApiClientError(
      response.status,
      error.code ?? "UNKNOWN_ERROR",
      error.message ?? `Request failed with status ${response.status}.`,
    );
  }
  return body as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, init),
  post: <T>(path: string, data?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body: data === undefined ? undefined : JSON.stringify(data) }),
  patch: <T>(path: string, data?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PATCH", body: data === undefined ? undefined : JSON.stringify(data) }),
  del: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "DELETE" }),
};
