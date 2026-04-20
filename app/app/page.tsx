"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { IconBook, IconHome } from "@tabler/icons-react"

import { AppHomeSectionCards } from "@/components/app/app-home-section-cards"
import { DashboardTopWidgets } from "@/components/app/dashboard-top-widgets"
import { readClientCookie } from "@/lib/read-client-cookie"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DatasetMeta = {
  dataset_id: string
  name?: string
  description?: string
  dataset_type?: string
  data_source?: string
}

type EventStats = {
  total_events: number
  event_type_counts: Record<string, number>
}

export default function AppHomePage() {
  const [datasets, setDatasets] = React.useState<DatasetMeta[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statsById, setStatsById] = React.useState<
    Record<string, EventStats | null>
  >({})

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/datasets")
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(json?.message ?? "Failed to load datasets")
        return
      }
      const list = (Array.isArray(json) ? json : []) as DatasetMeta[]
      setDatasets(list ?? [])

      const top = list.slice(0, 4)
      const pairs = await Promise.all(
        top.map(async (d) => {
          try {
            const r = await fetch(
              `/api/datasets/${encodeURIComponent(d.dataset_id)}/events/stats`
            )
            if (!r.ok) return [d.dataset_id, null] as const
            const s = (await r.json().catch(() => null)) as unknown
            if (!s || typeof s !== "object")
              return [d.dataset_id, null] as const
            const rec = s as Record<string, unknown>
            if (typeof rec.total_events !== "number")
              return [d.dataset_id, null] as const
            const counts =
              rec.event_type_counts && typeof rec.event_type_counts === "object"
                ? (rec.event_type_counts as Record<string, number>)
                : {}
            return [
              d.dataset_id,
              { total_events: rec.total_events, event_type_counts: counts },
            ] as const
          } catch {
            return [d.dataset_id, null] as const
          }
        })
      )
      const next: Record<string, EventStats | null> = {}
      for (const [id, s] of pairs) next[id] = s
      setStatsById(next)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load().catch(() => {})
  }, [])

  const totalEvents = React.useMemo(() => {
    let sum = 0
    let any = false
    for (const d of datasets.slice(0, 4)) {
      const s = statsById[d.dataset_id]?.total_events
      if (typeof s === "number") {
        sum += s
        any = true
      }
    }
    return any ? sum : -1
  }, [datasets, statsById])

  const sampledWithStats = React.useMemo(() => {
    return datasets.slice(0, 4).filter((d) => statsById[d.dataset_id] != null)
      .length
  }, [datasets, statsById])

  const sidebarStackRef = React.useRef<HTMLDivElement>(null)
  const [sidebarHeightPx, setSidebarHeightPx] = React.useState<
    number | undefined
  >(undefined)

  React.useLayoutEffect(() => {
    const stack = sidebarStackRef.current
    if (!stack) return

    function sync() {
      const isLg =
        typeof window !== "undefined" &&
        window.matchMedia("(min-width: 1024px)").matches
      if (!isLg) {
        setSidebarHeightPx(undefined)
        return
      }
      setSidebarHeightPx(sidebarStackRef.current?.offsetHeight)
    }

    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(stack)
    const mq = window.matchMedia("(min-width: 1024px)")
    mq.addEventListener("change", sync)
    window.addEventListener("resize", sync)
    return () => {
      ro.disconnect()
      mq.removeEventListener("change", sync)
      window.removeEventListener("resize", sync)
    }
  }, [datasets.length, loading])

  const pathname = usePathname()
  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  React.useEffect(() => {
    setUserEmail(readClientCookie("tango_user_email"))
  }, [pathname])

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
          {userEmail ? (
            <>
              , <span className="font-medium break-all">{userEmail}</span>
            </>
          ) : null}
        </h1>
        <p className="text-sm text-muted-foreground">
          Click a dataset in the list below to open its workspace and start
          analysing. API shortcuts stay in the sidebar when you have datasets.
        </p>
      </div>

      <DashboardTopWidgets />

      {loading ? (
        <Card className="p-5" data-slot="card">
          <LoadingSpinner className="min-h-36" label="Loading dashboard" />
        </Card>
      ) : datasets.length === 0 ? (
        <AppHomeSectionCards
          datasetCount={datasets.length}
          totalEvents={totalEvents}
          sampledDatasets={sampledWithStats}
        />
      ) : null}

      {loading ? (
        <Card className="p-0">
          <LoadingSpinner className="min-h-40" label="Loading datasets table" />
        </Card>
      ) : datasets.length === 0 ? (
        <Card className="p-6">
          <div className="text-sm font-semibold">No datasets yet</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first dataset using the sidebar or the “New dataset”
            button in the top bar, then ingest tickers to generate OHLC and
            derived extractions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/signup">
              <Button variant="outline">Invite a teammate</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-3">
          <Card
            className="flex min-h-0 w-full flex-col overflow-hidden p-0 lg:col-span-2"
            style={
              sidebarHeightPx !== undefined
                ? { height: sidebarHeightPx, minHeight: 0 }
                : undefined
            }
          >
            <div className="shrink-0 border-b px-5 py-4">
              <div className="text-sm font-semibold">Recent datasets</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Latest workspaces—open a dataset for charts, ingest, and
                predictions.
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((d) => (
                    <TableRow key={d.dataset_id}>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate font-medium">
                          {d.name ?? d.dataset_id}
                        </div>
                        {d.description ? (
                          <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {d.description}
                          </div>
                        ) : null}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {statsById[d.dataset_id]?.total_events != null ? (
                            <Badge variant="secondary" className="text-[10px]">
                              events {statsById[d.dataset_id]!.total_events}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[180px] font-mono text-xs text-muted-foreground md:table-cell">
                        <span className="block truncate">{d.dataset_id}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/app/datasets/${encodeURIComponent(d.dataset_id)}`}
                        >
                          <Button size="sm" variant="outline">
                            Open
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div
            ref={sidebarStackRef}
            className="flex w-full flex-col space-y-4 lg:min-w-0"
          >
            <AppHomeSectionCards
              datasetCount={datasets.length}
              totalEvents={totalEvents}
              sampledDatasets={sampledWithStats}
            />

            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <IconBook className="size-4 opacity-70" />
                API &amp; docs
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Combined gateway: collect, retrieve, export, and run predictive
                risk. Swagger is served from this app.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link href="/api/docs" target="_blank" rel="noreferrer">
                  <Button variant="default" className="w-full">
                    Swagger UI
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <IconHome className="mr-2 size-4" />
                    Marketing site
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
