import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

export async function GET() {
  const upstream = await tangoFetch("/datasets", {
    method: "GET",
    requireAuth: true,
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
      json ?? { error: "UPSTREAM_ERROR", message: msg ?? text },
      { status: upstream.status }
    )
  }

  return NextResponse.json(json ?? [])
}

export async function POST(req: Request) {
  const body = await req.text()
  const upstream = await tangoFetch("/datasets", {
    method: "POST",
    requireAuth: true,
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    body,
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
      json ?? { error: "UPSTREAM_ERROR", message: msg ?? text },
      { status: upstream.status }
    )
  }

  return NextResponse.json(json ?? { ok: true }, { status: upstream.status })
}
