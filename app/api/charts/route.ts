import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const upstream = await tangoFetch(`/charts${url.search}`, {
    method: "GET",
    requireAuth: true,
  })

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream"
  const buf = new Uint8Array(await upstream.arrayBuffer())

  return new NextResponse(buf, {
    status: upstream.status,
    headers: { "content-type": contentType },
  })
}
