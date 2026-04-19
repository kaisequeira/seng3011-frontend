import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"

type Params = { path: string[] }

async function proxy(req: Request, params: Params) {
  const url = new URL(req.url)
  const path = `/${params.path.map(encodeURIComponent).join("/")}${url.search}`

  const method = req.method.toUpperCase()
  const hasBody = method !== "GET" && method !== "HEAD"
  const body = hasBody ? await req.arrayBuffer() : null

  const upstream = await tangoFetch(path, {
    method,
    requireAuth: true,
    headers: {
      // forward content-type so CSV/PNG stays correct
      "content-type": req.headers.get("content-type") ?? "",
    },
    body: body ? Buffer.from(body) : null,
  })

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream"
  const buf = new Uint8Array(await upstream.arrayBuffer())

  const headers = new Headers()
  headers.set("content-type", contentType)
  const cacheControl = upstream.headers.get("cache-control")
  if (cacheControl) headers.set("cache-control", cacheControl)

  return new NextResponse(buf, { status: upstream.status, headers })
}

export async function GET(req: Request, ctx: { params: Promise<Params> }) {
  const params = await ctx.params
  return proxy(req, params)
}
export async function POST(req: Request, ctx: { params: Promise<Params> }) {
  const params = await ctx.params
  return proxy(req, params)
}
export async function PUT(req: Request, ctx: { params: Promise<Params> }) {
  const params = await ctx.params
  return proxy(req, params)
}
export async function DELETE(req: Request, ctx: { params: Promise<Params> }) {
  const params = await ctx.params
  return proxy(req, params)
}
