const BASE_URL = "https://digitalmoney.digitalhouse.com";

export class ApiError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  );
}

interface ApiOptions extends RequestInit {
  headers?: HeadersInit;
}

export async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Ocurrió un error. Intentá nuevamente.";

    throw new ApiError(message, response.status);
  }

  return data as T;
}