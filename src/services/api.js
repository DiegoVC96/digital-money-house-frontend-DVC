const BASE_URL = "https://digitalmoney.digitalhouse.com";

export async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Ocurrió un error. Intentá nuevamente.");
  }

  return data;
}