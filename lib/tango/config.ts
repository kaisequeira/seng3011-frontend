export function requireTangoBaseUrl(): string {
  const base = process.env.TANGO_API_BASE_URL
  if (!base) {
    throw new Error("Missing env var: TANGO_API_BASE_URL")
  }
  return base.replace(/\/+$/, "")
}
