import { NextResponse } from "next/server"

import { tangoFetch } from "@/lib/tango/fetch"
import { clearSessionCookies, getAccessToken } from "@/lib/tango/session"

export async function POST() {
  const tok = await getAccessToken()

  if (tok) {
    // Best-effort global sign-out; if it fails we still clear cookies locally.
    try {
      await tangoFetch("/auth/logout", {
        method: "POST",
        requireAuth: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken: tok }),
      })
    } catch {
      // ignore
    }
  }

  await clearSessionCookies()
  return NextResponse.json({ ok: true })
}
