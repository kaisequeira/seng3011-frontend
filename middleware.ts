import { NextRequest, NextResponse } from "next/server"

const ACCESS_COOKIE = "tango_access_token"

function isPublicAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/images/")
  )
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/api/") || isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE)?.value)

  if (pathname.startsWith("/app")) {
    if (hasSession) return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (pathname === "/login" || pathname === "/signup") {
    if (!hasSession) return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = "/app"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
}
