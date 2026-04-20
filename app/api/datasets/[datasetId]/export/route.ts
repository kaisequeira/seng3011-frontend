import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

type Params = { datasetId: string }

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  const { datasetId } = await ctx.params
  const url = new URL(req.url)
  const upstream = await tangoFetch(
    `/datasets/${encodeURIComponent(datasetId)}/export${url.search}`,
    { method: "GET", requireAuth: true }
  )

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream"
  const buf = new Uint8Array(await upstream.arrayBuffer())

  const headers = new Headers()
  headers.set("content-type", contentType)
  const disposition = upstream.headers.get("content-disposition")
  if (disposition) headers.set("content-disposition", disposition)

  return new NextResponse(buf, { status: upstream.status, headers })
}
