import { requireTangoBaseUrl } from "@/lib/tango/config"
import { getAccessToken } from "@/lib/tango/session"

export type TangoFetchOptions = {
  method?: string
  headers?: HeadersInit
  body?: BodyInit | null
  requireAuth?: boolean
  cache?: RequestCache
}

export async function tangoFetch(path: string, opts?: TangoFetchOptions) {
  const base = requireTangoBaseUrl()
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`

  const headers = new Headers(opts?.headers)
  if (
    !headers.has("content-type") &&
    opts?.body &&
    typeof opts.body === "string"
  ) {
    headers.set("content-type", "application/json")
  }

  const requireAuth = opts?.requireAuth !== false
  if (requireAuth) {
    const tok = await getAccessToken()
    if (tok) headers.set("authorization", `Bearer ${tok}`)
  }

  return fetch(url, {
    method: opts?.method ?? "GET",
    headers,
    body: opts?.body ?? null,
    cache: opts?.cache ?? "no-store",
  })
}
