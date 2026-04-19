import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
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

  const upstream = await tangoFetch("/auth/signup", {
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
    const rec = asRecord(json)
    const msg = rec && typeof rec.message === "string" ? rec.message : null
    return NextResponse.json(
      json ?? {
        error: "AUTH_SIGNUP_FAILED",
        message: msg ?? (text || "Signup failed"),
      },
      { status: upstream.status }
    )
  }

  // Best UX: auto-login after signup.
  const loginRes = await fetch(new URL("/api/auth/login", req.url), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (!loginRes.ok) {
    // Signup succeeded, but login failed; still return success.
    return NextResponse.json({ ok: true, login: "failed" })
  }

  return NextResponse.json({ ok: true })
}
