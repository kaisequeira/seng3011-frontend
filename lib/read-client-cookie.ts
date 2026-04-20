/** Read a non-HttpOnly cookie in the browser (e.g. `tango_user_email`). */
export function readClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[$()*+.?[\\\]^{|}]/g, "\\$&")}=([^;]*)`)
  )
  return m ? decodeURIComponent(m[1] ?? "") : null
}
