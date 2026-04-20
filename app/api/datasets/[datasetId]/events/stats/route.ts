import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

type Params = { datasetId: string }

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  const { datasetId } = await ctx.params
  const url = new URL(req.url)
  const path = `/datasets/${encodeURIComponent(datasetId)}/events/stats${url.search}`

  const upstream = await tangoFetch(path, { method: "GET", requireAuth: true })
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

  return NextResponse.json(json ?? {}, { status: upstream.status })
}
