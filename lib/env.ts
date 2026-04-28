export function getRequiredEnv(name: "BACKEND_API_URL" | "GATEWAY_BASE_URL"): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}
