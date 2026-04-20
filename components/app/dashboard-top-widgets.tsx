"use client"

import * as React from "react"
import { IconNews, IconBolt, IconChartHistogram } from "@tabler/icons-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type Headline = {
  title: string
  link: string
}

type HeadlinesPayload = {
  source: string
  items: Headline[]
}

type GridShockPayload = {
  generated_at: string
  regions: Array<{
    region: string
    level: string
    shock_score: number
  }>
}

type MangoSummaryPayload = {
  source: string
  cpi_latest: { date: string; value: number; change: number } | null
  unemp_latest: { date: string; value: number; change: number } | null
  error?: string
}

function riskTone(level: string) {
  switch (level) {
    case "LOW":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "ELEVATED":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "HIGH":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300"
    case "CRITICAL":
      return "bg-red-500/10 text-red-700 dark:text-red-300"
    default:
      return "bg-muted text-foreground"
  }
}

export function DashboardTopWidgets() {
  const [headlines, setHeadlines] = React.useState<HeadlinesPayload | null>(
    null
  )
  const [gridShock, setGridShock] = React.useState<GridShockPayload | null>(
    null
  )
  const [mangoSummary, setMangoSummary] =
    React.useState<MangoSummaryPayload | null>(null)
  const [loadingHeadlines, setLoadingHeadlines] = React.useState(true)
  const [loadingGrid, setLoadingGrid] = React.useState(true)
  const [loadingMango, setLoadingMango] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/market-headlines")
        const json = (await res
          .json()
          .catch(() => null)) as HeadlinesPayload | null
        if (!cancelled && json && Array.isArray(json.items)) setHeadlines(json)
      } finally {
        if (!cancelled) setLoadingHeadlines(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/tango/predict/macro-summary")
        const json = (await res
          .json()
          .catch(() => null)) as MangoSummaryPayload | null
        if (!cancelled && json) setMangoSummary(json)
      } finally {
        if (!cancelled) setLoadingMango(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/tango/predict/electricity-shock")
        const json = (await res
          .json()
          .catch(() => null)) as GridShockPayload | null
        if (!cancelled && json && Array.isArray(json.regions))
          setGridShock(json)
      } finally {
        if (!cancelled) setLoadingGrid(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="rounded-md bg-primary/10 p-1 text-primary">
              <IconNews className="size-3.5" />
            </div>
            News
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Live
          </Badge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Top headlines relevant to market context.
        </div>
        {loadingHeadlines ? (
          <LoadingSpinner className="mt-3 min-h-16" label="Loading news" />
        ) : headlines?.items?.length ? (
          <div className="mt-3 space-y-2">
            {headlines.items.slice(0, 3).map((h, idx) => (
              <a
                key={`${h.link}-${idx}`}
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-md border bg-muted/20 px-2.5 py-2 transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <div className="line-clamp-2 text-xs leading-snug text-foreground/90 group-hover:text-foreground">
                  {h.title}
                </div>
                <div className="mt-1 text-[10px] font-medium text-primary/80 group-hover:text-primary">
                  Open article
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-xs text-muted-foreground">
            Headlines unavailable.
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <IconBolt className="size-4 opacity-70" />
          ShockX
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Electricity-price shock snapshot by region.
        </div>
        {loadingGrid ? (
          <LoadingSpinner className="mt-3 min-h-16" label="Loading ShockX" />
        ) : gridShock?.regions?.length ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {gridShock.regions.slice(0, 4).map((r) => (
              <div key={r.region} className="rounded-md border bg-muted/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium">{r.region}</div>
                  <Badge className={`text-[10px] ${riskTone(r.level)}`}>
                    {r.level}
                  </Badge>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">
                  shock score
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-medium">
                    {r.shock_score.toFixed(3)}
                  </div>
                  <div className="h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{
                        width: `${Math.min(100, Math.max(0, r.shock_score * 1000))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-xs text-muted-foreground">
            Snapshot unavailable.
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="rounded-md bg-primary/10 p-1 text-primary">
              <IconChartHistogram className="size-3.5" />
            </div>
            Mango
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Macro
          </Badge>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Latest macro signals for volatility context.
        </div>
        {loadingMango ? (
          <LoadingSpinner
            className="mt-3 min-h-16"
            label="Loading Mango data"
          />
        ) : mangoSummary?.error ? (
          <div className="mt-3 text-xs text-muted-foreground">
            {mangoSummary.error}
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <div className="rounded-lg border bg-muted/20 p-2.5">
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                CPI
              </div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <div className="text-base font-semibold">
                  {mangoSummary?.cpi_latest
                    ? mangoSummary.cpi_latest.value.toFixed(2)
                    : "--"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {mangoSummary?.cpi_latest?.date ?? "Unavailable"}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                Δ{" "}
                {mangoSummary?.cpi_latest
                  ? mangoSummary.cpi_latest.change.toFixed(2)
                  : "--"}
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-2.5">
              <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                Unemployment
              </div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <div className="text-base font-semibold">
                  {mangoSummary?.unemp_latest
                    ? mangoSummary.unemp_latest.value.toFixed(2)
                    : "--"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {mangoSummary?.unemp_latest?.date ?? "Unavailable"}
                </div>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">
                Δ{" "}
                {mangoSummary?.unemp_latest
                  ? mangoSummary.unemp_latest.change.toFixed(2)
                  : "--"}
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Source: {mangoSummary?.source ?? "Mango API"}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
