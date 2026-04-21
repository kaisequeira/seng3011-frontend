export function requireTangoBaseUrl(): string {
  const base = process.env.TANGO_API_BASE_URL
  if (!base) {
    throw new Error("Missing env var: TANGO_API_BASE_URL")
  }
  return base.replace(/\/+$/, "")
}

export function buildTangoDocsUrl(baseUrl: string): string {
  const normalized = baseUrl.replace(/\/+$/, "")
  return `${normalized}/docs`
}

export function requireTangoDocsUrl(): string {
  return buildTangoDocsUrl(requireTangoBaseUrl())
}
