export const API_BASE = "/api";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: "include"
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}