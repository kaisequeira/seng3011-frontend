import { cookies } from "next/headers"

export const tangoCookies = {
  access: "tango_access_token",
  id: "tango_id_token",
  refresh: "tango_refresh_token",
} as const

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(tangoCookies.access)?.value ?? null
}

export async function clearSessionCookies() {
  const store = await cookies()
  store.set(tangoCookies.access, "", { path: "/", maxAge: 0 })
  store.set(tangoCookies.id, "", { path: "/", maxAge: 0 })
  store.set(tangoCookies.refresh, "", { path: "/", maxAge: 0 })
}

export async function setSessionCookies(tokens: {
  accessToken: string
  idToken?: string
  refreshToken?: string
}) {
  const store = await cookies()
  const isProd = process.env.NODE_ENV === "production"

  const baseOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  }

  store.set(tangoCookies.access, tokens.accessToken, baseOpts)
  if (tokens.idToken) store.set(tangoCookies.id, tokens.idToken, baseOpts)
  if (tokens.refreshToken)
    store.set(tangoCookies.refresh, tokens.refreshToken, baseOpts)
}
