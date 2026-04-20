import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

type Params = { datasetId: string }

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

async function jsonProxy(
  upstream: Response
): Promise<{ ok: boolean; status: number; json: unknown; text: string }> {
  const text = await upstream.text()
  let json: unknown = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return { ok: upstream.ok, status: upstream.status, json, text }
}

export async function GET(_req: Request, ctx: { params: Promise<Params> }) {
  const { datasetId } = await ctx.params
  const upstream = await tangoFetch(
    `/datasets/${encodeURIComponent(datasetId)}`,
    {
      method: "GET",
      requireAuth: true,
    }
  )
  const { ok, status, json, text } = await jsonProxy(upstream)

  if (!ok) {
    const rec = asRecord(json)
    const msg = rec && typeof rec.message === "string" ? rec.message : null
    return NextResponse.json(
      json ?? { error: "UPSTREAM_ERROR", message: msg ?? text },
      { status }
    )
  }

  return NextResponse.json(json ?? {}, { status })
}

export async function PUT(req: Request, ctx: { params: Promise<Params> }) {
  const { datasetId } = await ctx.params
  const body = await req.text()

  const upstream = await tangoFetch(
    `/datasets/${encodeURIComponent(datasetId)}`,
    {
      method: "PUT",
      requireAuth: true,
      headers: {
        "content-type": req.headers.get("content-type") ?? "application/json",
      },
      body,
    }
  )
  const { ok, status, json, text } = await jsonProxy(upstream)

  if (!ok) {
    const rec = asRecord(json)
    const msg = rec && typeof rec.message === "string" ? rec.message : null
    return NextResponse.json(
      json ?? { error: "UPSTREAM_ERROR", message: msg ?? text },
      { status }
    )
  }

  return NextResponse.json(json ?? { ok: true }, { status })
}

export async function DELETE(_req: Request, ctx: { params: Promise<Params> }) {
  const { datasetId } = await ctx.params
  const upstream = await tangoFetch(
    `/datasets/${encodeURIComponent(datasetId)}`,
    {
      method: "DELETE",
      requireAuth: true,
    }
  )
  const { ok, status, json, text } = await jsonProxy(upstream)

  if (!ok) {
    const rec = asRecord(json)
    const msg = rec && typeof rec.message === "string" ? rec.message : null
    return NextResponse.json(
      json ?? { error: "UPSTREAM_ERROR", message: msg ?? text },
      { status }
    )
  }

  return NextResponse.json(json ?? { ok: true }, { status })
}
