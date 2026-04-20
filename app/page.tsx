import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartBarInteractive } from "@/components/chart-bar-interactive"
import { ChartLineMultiple } from "@/components/chart-line-multiple"
import { MarketingFooter } from "@/components/marketing/footer"
import { TangoIntegrationsCards } from "@/components/marketing/tango-integrations-cards"
import { TangoMarketingSectionCards } from "@/components/marketing/tango-marketing-section-cards"
import { Card } from "@/components/ui/card"
import { LinkButton } from "@/components/ui/link-button"
import { AnchorButton } from "@/components/ui/anchor-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Page() {
  const mailto = `mailto:z5591304@ad.unsw.edu.au?subject=${encodeURIComponent(
    "TANGO API collaboration"
  )}&body=${encodeURIComponent(
    "Hi Alex,\n\nWe are using the TANGO Financial Events APIs and would like to collaborate. Could you share any usage notes, rate limits, and recommended workflows for LocalStack vs AWS?\n\nThanks,\n"
  )}`

  const apiBaseConfigured = process.env.TANGO_API_BASE_URL
  const apiBase = {
    configured: apiBaseConfigured || undefined,
    example: "https://<api-id>.execute-api.<region>.amazonaws.com/prod",
  }

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
          <LinkButton href="/login" variant="ghost">
            Sign in
          </LinkButton>
          <LinkButton href="/signup">
            Get started
            <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
          </LinkButton>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="space-y-6 py-10">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Turn raw market data into decisions your team can act on.
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              TANGO collects, normalises, and serves financial event datasets,
              then layers forecasting on top. The combined gateway covers auth,
              datasets, charts, exports, and predictive risk—ready for demos and
              coursework.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <LinkButton href="/signup">Create account</LinkButton>
              <LinkButton href="/login?next=/app" variant="outline">
                Open dashboard
              </LinkButton>
            </div>
          </div>
          <TangoMarketingSectionCards />
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Product tour</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Dataset-first flow: create → ingest → explore → forecast.
              </p>
            </div>
            <LinkButton href="/login?next=/app" variant="outline" size="sm">
              Open dashboard
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 size-4" />
            </LinkButton>
          </div>

          <Card className="mt-6 overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Step</TableHead>
                  <TableHead>What you do</TableHead>
                  <TableHead className="text-right font-mono">
                    Example
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">1</TableCell>
                  <TableCell>
                    Create a dataset workspace for ADAGE events and derived
                    extractions.
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    POST /datasets
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">2</TableCell>
                  <TableCell>
                    Ingest tickers: daily OHLC plus deterministic derived
                    signals.
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    PUT /datasets/:id/events
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">3</TableCell>
                  <TableCell>
                    Run next-7-day spike probability with macro + grid overlays.
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    POST /predict/run
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        <section className="space-y-4 py-10">
          <div>
            <h2 className="text-sm font-semibold">TANGO API</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Illustrative traffic and route mix—pair with live Swagger for real
              contracts.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartAreaInteractive />
            <ChartLineMultiple />
          </div>
          <ChartBarInteractive />
        </section>

        <section className="py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Integrations</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Macro regimes and grid shock overlays that feed the forecast.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md border bg-muted px-2 py-0.5">
                Mango
              </span>
              <span className="rounded-md border bg-muted px-2 py-0.5">
                GridX
              </span>
            </div>
          </div>
          <div className="mt-6">
            <TangoIntegrationsCards />
          </div>
        </section>

        <section className="py-10">
          <Card className="relative overflow-hidden p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.84_0.12_95)_0%,transparent_55%),radial-gradient(circle_at_80%_70%,oklch(0.84_0.08_250)_0%,transparent_55%)] opacity-25" />
            <div className="relative flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <div className="text-sm font-semibold">
                  Create a dataset in 60 seconds
                </div>
                <div className="text-sm text-muted-foreground">
                  Start with a few tickers, explore events, then run spike-risk
                  with Mango + GridX overlays.
                </div>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <LinkButton href="/signup" className="w-full sm:w-auto">
                  Get started
                </LinkButton>
                <LinkButton
                  href="/api/docs"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Swagger docs
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    className="ml-2 size-4"
                  />
                </LinkButton>
                <AnchorButton
                  href={mailto}
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  Contact
                  <HugeiconsIcon icon={Mail01Icon} className="ml-2 size-4" />
                </AnchorButton>
              </div>
            </div>
          </Card>
        </section>

        <MarketingFooter apiBase={apiBase} mailto={mailto} />
      </main>
    </div>
  )
}
