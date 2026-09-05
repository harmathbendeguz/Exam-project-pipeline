// The one place that knows how to talk HTTP to the API. Every other file
// under src/api/ calls request() instead of fetch() directly — mirrors the
// backend's own rule that only repositories touch the database: here,
// only this module touches the network.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// ha nicns kitöltve akkor használja a basic localhost url-t


export async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message = body?.error || `Request to ${path} failed with ${res.status}`;
    throw new Error(message);
  }

  return body;
}

export { BASE_URL };
