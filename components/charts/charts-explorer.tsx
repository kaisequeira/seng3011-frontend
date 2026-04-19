"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { MultiSelect } from "@/components/charts/multi-select"

type DatasetMeta = {
  dataset_id: string
  name?: string
  description?: string
  dataset_type?: string
  data_source?: string
}

type AdageEvent = {
  time_object: { timestamp: string; timezone?: string }
  event_type: string
  attribute: Record<string, unknown>
}

type EventsResponse = {
  retrieved?: number
  dataset?: { dataset_id: string; events?: AdageEvent[] }
}

type ChartRow = {
  date: string
  // dynamic keys (close_*, volume_*, ret_*)
  [key: string]: string | number | null
}

function stablePalette(i: number) {
  const hue = (i * 47) % 360
  return `hsl(${hue} 70% 45%)`
}

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

function messageFrom(x: unknown): string | null {
  const rec = asRecord(x)
  return rec && typeof rec.message === "string" ? rec.message : null
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function parseDateKey(ts: string) {
  // upstream timestamps are often "YYYY-MM-DD HH:mm:ss.SSS" (UTC)
  // We only need the day bucket.
  const s = String(ts)
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : s.slice(0, 10)
}

function sanitizeKey(s: string) {
  return s.replace(/[^a-zA-Z0-9_]/g, "_")
}

function buildSeries(events: AdageEvent[]) {
  const ohlc = events.filter((e) => e.event_type === "stock_ohlc")

  // Symbol -> date -> { close, volume }
  const bySymbol = new Map<
    string,
    Map<string, { close: number | null; volume: number | null }>
  >()
  for (const ev of ohlc) {
    const sym =
      typeof ev.attribute?.symbol === "string" ? ev.attribute.symbol : "UNKNOWN"
    const date = parseDateKey(ev.time_object?.timestamp ?? "")
    const close =
      typeof ev.attribute?.close === "number" ? ev.attribute.close : null
    const volume =
      typeof ev.attribute?.volume === "number" ? ev.attribute.volume : null

    if (!bySymbol.has(sym)) bySymbol.set(sym, new Map())
    bySymbol.get(sym)!.set(date, { close, volume })
  }

  const symbols = [...bySymbol.keys()].sort()
  const allDates = new Set<string>()
  for (const [, m] of bySymbol) for (const d of m.keys()) allDates.add(d)
  const dates = [...allDates].sort()

  const rows: ChartRow[] = dates.map((date) => ({ date }))

  // Close + volume
  for (const sym of symbols) {
    const k = sanitizeKey(sym)
    const closeKey = `close_${k}`
    const volKey = `volume_${k}`
    const retKey = `ret_${k}`

    const m = bySymbol.get(sym)!
    let prevClose: number | null = null
    for (const row of rows) {
      const point = m.get(row.date)
      const close = point?.close ?? null
      const volume = point?.volume ?? null

      row[closeKey] = close
      row[volKey] = volume

      if (close != null && prevClose != null && prevClose !== 0) {
        row[retKey] = close / prevClose - 1
      } else {
        row[retKey] = null
      }
      prevClose = close ?? prevClose
    }
  }

  return { symbols, rows }
}

function buildChartConfig(
  symbols: string[],
  prefix: "close" | "volume" | "ret"
): ChartConfig {
  const cfg: ChartConfig = {}
  symbols.forEach((sym, idx) => {
    const k = `${prefix}_${sanitizeKey(sym)}`
    cfg[k] = { label: sym, color: stablePalette(idx) }
  })
  return cfg
}

function riskHintFromReturn(r: number | null) {
  if (r == null) return null
  const a = Math.abs(r)
  if (a >= 0.05) return "CRITICAL"
  if (a >= 0.03) return "HIGH"
  if (a >= 0.015) return "ELEVATED"
  return "LOW"
}

export function ChartsExplorer() {
  const search = useSearchParams()
  const [datasets, setDatasets] = React.useState<DatasetMeta[] | null>(null)
  const [datasetId, setDatasetId] = React.useState<string>("")

  const today = React.useMemo(() => new Date(), [])
  const defaultStart = React.useMemo(() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - 6)
    return d
  }, [today])

  const [startDate, setStartDate] = React.useState<string>(
    toIsoDate(defaultStart)
  )
  const [endDate, setEndDate] = React.useState<string>(toIsoDate(today))
  const [symbols, setSymbols] = React.useState<string[]>([])
  const [availableSymbols, setAvailableSymbols] = React.useState<string[]>([])

  const [loadingEvents, setLoadingEvents] = React.useState(false)
  const [events, setEvents] = React.useState<AdageEvent[] | null>(null)

  const { seriesSymbols, rows, lastReturnLevel } = React.useMemo(() => {
    if (!events)
      return {
        seriesSymbols: [] as string[],
        rows: [] as ChartRow[],
        lastReturnLevel: null as string | null,
      }
    const { symbols: allSymbols, rows } = buildSeries(events)
    const used = symbols.length
      ? allSymbols.filter((s) => symbols.includes(s))
      : allSymbols

    // Filter row keys down to selected symbols for chart readability.
    const usedKeys = new Set<string>()
    for (const sym of used) {
      const k = sanitizeKey(sym)
      usedKeys.add(`close_${k}`)
      usedKeys.add(`volume_${k}`)
      usedKeys.add(`ret_${k}`)
    }

    const trimmed = rows.map((r) => {
      const o: ChartRow = { date: r.date }
      for (const [k, v] of Object.entries(r)) {
        if (k === "date" || usedKeys.has(k)) o[k] = v
      }
      return o
    })

    const last = trimmed[trimmed.length - 1]
    let anyReturn: number | null = null
    if (last) {
      for (const sym of used) {
        const rk = `ret_${sanitizeKey(sym)}`
        const v = typeof last[rk] === "number" ? (last[rk] as number) : null
        if (v != null) {
          anyReturn = v
          break
        }
      }
    }

    return {
      seriesSymbols: used,
      rows: trimmed,
      lastReturnLevel: riskHintFromReturn(anyReturn),
    }
  }, [events, symbols])

  const closeCfg = React.useMemo(
    () => buildChartConfig(seriesSymbols, "close"),
    [seriesSymbols]
  )
  const volCfg = React.useMemo(
    () => buildChartConfig(seriesSymbols, "volume"),
    [seriesSymbols]
  )
  const retCfg = React.useMemo(
    () => buildChartConfig(seriesSymbols, "ret"),
    [seriesSymbols]
  )

  async function loadDatasets() {
    const res = await fetch("/api/datasets", { method: "GET" })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(json?.message ?? "Failed to load datasets")
      return
    }
    setDatasets(Array.isArray(json) ? (json as DatasetMeta[]) : [])
  }

  React.useEffect(() => {
    loadDatasets().catch(() => {})
  }, [])

  React.useEffect(() => {
    const qp = search.get("dataset")
    if (qp && qp !== datasetId) setDatasetId(qp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  React.useEffect(() => {
    if (!datasets || datasetId) return
    if (datasets.length) setDatasetId(datasets[0].dataset_id)
  }, [datasets, datasetId])

  async function loadEvents() {
    if (!datasetId) return
    setLoadingEvents(true)
    try {
      const qs = new URLSearchParams()
      qs.set("event_type", "stock_ohlc")
      qs.set("order", "ASC")
      qs.set("sort", "time")
      qs.set("limit", "1000")
      if (startDate) qs.set("start_date", startDate)
      if (endDate) qs.set("end_date", endDate)
      if (symbols.length) qs.set("companies", symbols.join(","))

      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}/events?${qs.toString()}`
      )
      const json = (await res.json().catch(() => null)) as EventsResponse | null
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load events")
        setEvents(null)
        return
      }

      const evs = json?.dataset?.events ?? []
      setEvents(evs)

      // If user hasn't picked symbols yet, populate options from response.
      const unique = new Set<string>()
      for (const ev of evs) {
        const s =
          typeof ev.attribute?.symbol === "string" ? ev.attribute.symbol : ""
        if (s) unique.add(s)
      }
      const all = [...unique].sort()
      setAvailableSymbols(all)

      if (!symbols.length && all.length) {
        // Default to first 3 for readability if there are many.
        setSymbols(all.slice(0, Math.min(all.length, 3)))
      }
    } finally {
      setLoadingEvents(false)
    }
  }

  React.useEffect(() => {
    // Autoload once we have a dataset, and reset symbol state so dataset switches don't "filter to old symbols".
    if (!datasetId || !datasets) return
    setSymbols([])
    setAvailableSymbols([])
    setEvents(null)
    loadEvents().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, datasets])

  const hasData = rows.length > 1 && seriesSymbols.length > 0

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">
          Interactive Charts
        </h1>
        <p className="text-sm text-muted-foreground">
          We render charts directly from OHLC events (close, volume, daily
          returns). No PNG by default.
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Dataset</Label>
            {datasets ? (
              <Select
                value={datasetId}
                onValueChange={(value) => {
                  setDatasetId(value ?? "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((d) => (
                    <SelectItem key={d.dataset_id} value={d.dataset_id}>
                      {d.name ? `${d.name} (${d.dataset_id})` : d.dataset_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Skeleton className="h-9 w-full" />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Start</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Companies</Label>
            <MultiSelect
              value={symbols}
              onValueChange={setSymbols}
              placeholder="Pick symbols"
              // Options come from the most recent fetch (usually "all symbols" on first load).
              options={availableSymbols}
              allowCustom
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            onClick={() => loadEvents().catch(() => {})}
            disabled={!datasetId || loadingEvents}
          >
            {loadingEvents ? "Loading..." : "Reload"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSymbols([])
              toast.message("Showing all symbols (may be busy).")
            }}
            disabled={!datasetId}
          >
            Show all symbols
          </Button>
          <div className="ml-auto text-xs text-muted-foreground">
            {lastReturnLevel ? `Latest move hint: ${lastReturnLevel}` : null}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        {!datasetId ? (
          <div className="text-sm text-muted-foreground">
            Pick a dataset to begin.
          </div>
        ) : loadingEvents && !events ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !hasData ? (
          <div className="text-sm text-muted-foreground">
            No OHLC events found for this selection. Try widening the date range
            or picking a different dataset.
          </div>
        ) : (
          <Tabs defaultValue="price">
            <TabsList>
              <TabsTrigger value="price">Price (Close)</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
              <TabsTrigger value="png" id="png">
                Server PNG (optional)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="price" className="mt-4">
              <ChartContainer className="h-80 w-full" config={closeCfg}>
                <LineChart data={rows}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickMargin={8} minTickGap={30} />
                  <YAxis tickMargin={8} width={64} />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {seriesSymbols.map((sym, idx) => {
                    const key = `close_${sanitizeKey(sym)}`
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={`var(--color-${key})`}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={idx < 3}
                        connectNulls
                      />
                    )
                  })}
                </LineChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="volume" className="mt-4">
              <ChartContainer className="h-80 w-full" config={volCfg}>
                <BarChart data={rows}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickMargin={8} minTickGap={30} />
                  <YAxis tickMargin={8} width={64} />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {seriesSymbols.map((sym) => {
                    const key = `volume_${sanitizeKey(sym)}`
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={`var(--color-${key})`}
                        stackId={seriesSymbols.length > 1 ? "v" : undefined}
                        isAnimationActive={false}
                      />
                    )
                  })}
                </BarChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="returns" className="mt-4">
              <ChartContainer className="h-80 w-full" config={retCfg}>
                <LineChart data={rows}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickMargin={8} minTickGap={30} />
                  <YAxis tickMargin={8} width={64} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        formatter={(value, name) => {
                          const v =
                            typeof value === "number" ? value : Number(value)
                          return (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {String(name)}
                              </span>
                              <span className="font-mono tabular-nums">
                                {Number.isFinite(v)
                                  ? `${(v * 100).toFixed(2)}%`
                                  : "-"}
                              </span>
                            </div>
                          )
                        }}
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  {seriesSymbols.map((sym) => {
                    const key = `ret_${sanitizeKey(sym)}`
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={`var(--color-${key})`}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                      />
                    )
                  })}
                </LineChart>
              </ChartContainer>
            </TabsContent>

            <TabsContent value="png" className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                This uses the backend `GET /charts` route (PNG). Handy for
                export, but the interactive charts above are the main UX.
              </p>
              <PngExport
                datasetId={datasetId}
                startDate={startDate}
                endDate={endDate}
                symbols={symbols}
              />
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  )
}

function PngExport(props: {
  datasetId: string
  startDate: string
  endDate: string
  symbols: string[]
}) {
  const qs = new URLSearchParams()
  qs.set("dataset_id", props.datasetId)
  qs.set("event_type", "stock_ohlc")
  if (props.startDate) qs.set("start_date", props.startDate)
  if (props.endDate) qs.set("end_date", props.endDate)
  if (props.symbols.length) qs.set("companies", props.symbols.join(","))

  const src = `/api/charts?${qs.toString()}`

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.open(src, "_blank", "noreferrer")
          }}
        >
          Open PNG in new tab
        </Button>
        <div className="text-xs text-muted-foreground">{src}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Server-rendered chart"
        src={src}
        className="w-full rounded-lg border"
      />
    </div>
  )
}
