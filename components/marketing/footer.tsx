import Link from "next/link"

import { Card } from "@/components/ui/card"

export function MarketingFooter({
  apiBase,
  mailto,
}: {
  apiBase: { configured?: string; example: string }
  mailto: string
}) {
  return (
    <footer className="pt-10 pb-14">
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">TANGO</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Dataset-first event intelligence + predictive risk overlays.
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold">Links</div>
            <div className="mt-2 grid gap-2 text-xs">
              <Link
                href="/signup"
                className="text-muted-foreground hover:text-foreground"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/api/docs"
                className="text-muted-foreground hover:text-foreground"
              >
                Swagger docs
              </Link>
              <a
                className="text-muted-foreground hover:text-foreground"
                href={mailto}
              >
                Contact (email)
              </a>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold">Gateway</div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div className="font-mono break-all">
                API base: {apiBase.configured || apiBase.example}
              </div>
              <div className="font-mono break-all">Swagger: /api/docs</div>
            </div>
          </div>
        </div>
      </Card>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TANGO. Built for SENG3011.
      </div>
    </footer>
  )
}
