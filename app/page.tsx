import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ChartBarLineIcon,
  DatabaseIcon,
  Radar02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.92_0.08_95)_0%,transparent_55%),radial-gradient(circle_at_70%_30%,oklch(0.92_0.07_250)_0%,transparent_55%),radial-gradient(circle_at_50%_80%,oklch(0.95_0.05_40)_0%,transparent_60%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(to_right,oklch(0.92_0_0)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0_0)_1px,transparent_1px)] [background-size:48px_48px] opacity-30" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-lg bg-foreground text-background">
            <span className="font-mono text-xs">TG</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">TANGO</div>
            <div className="text-xs text-muted-foreground">
              Event Intelligence
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>
              Get started
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
            </Button>
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="grid gap-10 py-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">ADAGE 3.0 events</Badge>
              <Badge variant="secondary">Cognito-backed access</Badge>
              <Badge variant="secondary">Predictive risk</Badge>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Turn raw market data into decisions your team can act on.
            </h1>
            <p className="max-w-prose text-sm leading-relaxed text-pretty text-muted-foreground md:text-base">
              TANGO collects, normalises, and serves financial event datasets,
              then layers forecasting on top. Build dashboards, automate alerts,
              and model risk with clean interfaces.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Create account
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-2 size-4"
                  />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Open dashboard
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: press <span className="font-mono">d</span> to toggle dark
              mode.
            </p>
          </div>

          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,oklch(0.85_0.12_95)_0%,transparent_40%),radial-gradient(circle_at_80%_60%,oklch(0.82_0.11_250)_0%,transparent_45%)] opacity-25" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Weekly Risk Outlook</div>
                <Badge>Live</Badge>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { k: "Dataset", v: "daily_stock_ohlc_data" },
                  { k: "Forecast", v: "Spike prob (7d)" },
                  { k: "Signal", v: "Macro + Grid shock" },
                ].map((x) => (
                  <div key={x.k} className="rounded-lg border bg-card p-3">
                    <div className="text-xs text-muted-foreground">{x.k}</div>
                    <div className="mt-1 truncate text-xs font-medium">
                      {x.v}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">
                    Top Movers (predicted)
                  </div>
                  <div className="text-xs text-muted-foreground">
                    next 7 days
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { s: "NVDA.XNAS", p: "0.31", lvl: "ELEVATED" },
                    { s: "AAPL.XNAS", p: "0.18", lvl: "LOW" },
                    { s: "MSFT.XNAS", p: "0.22", lvl: "LOW" },
                  ].map((r) => (
                    <div
                      key={r.s}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="font-mono">{r.s}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{r.lvl}</Badge>
                        <div className="font-mono text-muted-foreground">
                          {r.p}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 py-10 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: DatabaseIcon,
              title: "Datasets",
              desc: "Create, ingest, query, and export stock events in ADAGE format.",
            },
            {
              icon: ChartBarLineIcon,
              title: "Interactive Charts",
              desc: "Explore OHLC-derived series with fast filters and clean visuals.",
            },
            {
              icon: Radar02Icon,
              title: "Predictive Risk",
              desc: "Train a volatility spike model and run forecasts per symbol.",
            },
            {
              icon: Shield01Icon,
              title: "Secure Access",
              desc: "Cognito-backed sessions; tokens stay in HTTP-only cookies.",
            },
          ].map((f) => (
            <Card key={f.title} className="p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={f.icon} className="size-5" />
                </div>
                <div className="text-sm font-semibold">{f.title}</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
