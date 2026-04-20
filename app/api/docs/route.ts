import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const upstream = await tangoFetch(`/docs${url.search}`, {
    method: "GET",
    requireAuth: false,
  })

  const contentType =
    upstream.headers.get("content-type") ?? "text/html; charset=utf-8"
  const buf = new Uint8Array(await upstream.arrayBuffer())

  return new NextResponse(buf, {
    status: upstream.status,
    headers: { "content-type": contentType },
  })
}
