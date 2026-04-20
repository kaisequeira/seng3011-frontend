import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"
import { setSessionCookies } from "@/lib/tango/session"

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".")
  if (parts.length < 2) return null
  const payload = parts[1] ?? ""
  try {
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : ""
    const json = Buffer.from(`${b64}${pad}`, "base64").toString("utf8")
    const parsed = JSON.parse(json) as unknown
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === "string" ? body.email : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!email || !password) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "email and password are required" },
      { status: 400 }
    )
  }

  const upstream = await tangoFetch("/auth/login", {
    method: "POST",
    requireAuth: false,
    body: JSON.stringify({ email, password }),
    headers: { "content-type": "application/json" },
  })

  const text = await upstream.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }

  if (!upstream.ok) {
    return NextResponse.json(
      json ?? { error: "AUTH_LOGIN_FAILED", message: text || "Login failed" },
      { status: upstream.status }
    )
  }

  const rec = asRecord(json)
  const accessToken =
    rec && typeof rec.accessToken === "string" ? rec.accessToken : null
  const idToken =
    rec && typeof rec.idToken === "string" ? rec.idToken : undefined
  const refreshToken =
    rec && typeof rec.refreshToken === "string" ? rec.refreshToken : undefined

  if (!accessToken) {
    return NextResponse.json(
      {
        error: "AUTH_LOGIN_FAILED",
        message: "Missing accessToken from upstream",
      },
      { status: 502 }
    )
  }

  const jwt = idToken ? decodeJwtPayload(idToken) : null
  const displayEmail =
    (jwt && typeof jwt.email === "string" && jwt.email) ||
    (jwt &&
      typeof jwt["cognito:username"] === "string" &&
      jwt["cognito:username"]) ||
    undefined

  await setSessionCookies({
    accessToken,
    idToken,
    refreshToken,
    userEmail: displayEmail,
  })

  return NextResponse.json({ ok: true })
}
