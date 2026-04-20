"use client"

import * as React from "react"
import {
  IconCalendar,
  IconExternalLink,
  IconNews,
  IconUser,
} from "@tabler/icons-react"

import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

type Headline = {
  title: string
  link: string
  publishedAt: string | null
  author: string | null
}

type ApiPayload = {
  source: string
  items: Headline[]
  error?: string
}

function formatPublished(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export function DashboardMarketPulse() {
  const [data, setData] = React.useState<ApiPayload | null>(null)

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/market-headlines")
        const json = (await res.json().catch(() => null)) as ApiPayload | null
        if (!cancelled && json && Array.isArray(json.items)) setData(json)
        else if (!cancelled)
          setData({ source: "MarketWatch (RSS)", items: [], error: "parse" })
      } catch {
        if (!cancelled)
          setData({ source: "MarketWatch (RSS)", items: [], error: "network" })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (data === null) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <IconNews className="size-4 opacity-70" />
          Market headlines
        </div>
        <Card className="p-4" data-slot="card" size="sm">
          <LoadingSpinner
            className="min-h-28"
            label="Loading market headlines"
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <IconNews className="size-4 shrink-0 opacity-70" />
            Market headlines
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.source.replace(" (RSS)", "")} · refreshed every few minutes
          </p>
        </div>
      </div>

      {data.error && data.items.length === 0 ? (
        <Card className="p-4" size="sm">
          <p className="text-xs text-muted-foreground">
            Headlines unavailable right now. Your datasets below are unchanged.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((item, i) => {
            const when = formatPublished(item.publishedAt)
            const body = (
              <>
                <h3 className="line-clamp-3 text-xs leading-snug font-medium text-foreground">
                  {item.title}
                </h3>
                {(when || item.author) && (
                  <div className="mt-2 flex flex-col gap-1 text-[10px] text-muted-foreground">
                    {when ? (
                      <span className="flex items-center gap-1">
                        <IconCalendar className="size-3 shrink-0 opacity-70" />
                        {when}
                      </span>
                    ) : null}
                    {item.author ? (
                      <span className="flex items-center gap-1">
                        <IconUser className="size-3 shrink-0 opacity-70" />
                        {item.author}
                      </span>
                    ) : null}
                  </div>
                )}
              </>
            )

            return (
              <Card
                key={`${item.link}-${i}`}
                className="group relative overflow-hidden bg-gradient-to-b from-primary/[0.06] to-card shadow-xs ring-1 ring-border/60 transition-shadow hover:ring-border"
                data-slot="card"
                size="sm"
              >
                <div className="p-4">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {body}
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                        Read article
                        <IconExternalLink className="size-3 opacity-70 transition-opacity group-hover:opacity-100" />
                      </span>
                    </a>
                  ) : (
                    body
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
