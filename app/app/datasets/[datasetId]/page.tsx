"use client"

import * as React from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
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
import { Loader2, Pencil, RefreshCw, Save, Trash2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/charts/multi-select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type DatasetMeta = {
  dataset_id: string
  name?: string
  description?: string
  dataset_type?: string
  data_source?: string
  time_object?: { timestamp: string; timezone?: string }
}

type EventStats = {
  total_events: number
  event_type_counts: Record<string, number>
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

type FetchEventsResponse = {
  count?: number
  raw_event_count?: number
  derived_event_count?: number
  event_type_counts?: Record<string, number>
}

type TrainResponse = {
  model_id: string
  trained_at: string
  feature_list: string[]
  metrics: { auc: number; precision: number; recall: number }
}

type RunResponse = {
  as_of: string
  predictions: {
    symbol: string
    p_spike_7d: number
    risk_level: "LOW" | "ELEVATED" | "HIGH" | "CRITICAL" | string
    drivers: string[]
  }[]
}

type ChartRow = {
  date: string
  [key: string]: string | number | null
}

const MODEL_STORAGE_KEY = "tango_models_v1"

/** Macro window sent with train requests; Mango serves CPI + unemployment for these ranges. */
const TRAIN_MACRO_WINDOW = {
  cpi_start: "2023-Q1",
  cpi_end: "2026-Q1",
  unemp_start: "2023-01",
  unemp_end: "2026-03",
} as const

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

function messageFrom(x: unknown): string | null {
  const rec = asRecord(x)
  return rec && typeof rec.message === "string" ? rec.message : null
}

function stablePalette(i: number) {
  const hue = (i * 47) % 360
  return `hsl(${hue} 70% 45%)`
}

function sanitizeKey(s: string) {
  return s.replace(/[^a-zA-Z0-9_]/g, "_")
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function parseDateKey(ts: string) {
  const s = String(ts)
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  return m ? m[1] : s.slice(0, 10)
}

function buildSeries(events: AdageEvent[]) {
  const ohlc = events.filter((e) => e.event_type === "stock_ohlc")

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

function pct(x: number) {
  return `${(x * 100).toFixed(1)}%`
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

export default function DatasetWorkspacePage() {
  const router = useRouter()
  const params = useParams<{ datasetId: string }>()
  const datasetId = String(params.datasetId ?? "")

  const prefsKey = React.useMemo(
    () => `tango_ds_prefs_v1:${datasetId}`,
    [datasetId]
  )

  const today = React.useMemo(() => new Date(), [])
  const defaultStart = React.useMemo(() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - 6)
    return d
  }, [today])

  const [meta, setMeta] = React.useState<DatasetMeta | null>(null)
  const [stats, setStats] = React.useState<EventStats | null>(null)
  const [loadingMeta, setLoadingMeta] = React.useState(false)
  const [loadingStats, setLoadingStats] = React.useState(false)

  const [chartStart, setChartStart] = React.useState<string>(
    toIsoDate(defaultStart)
  )
  const [chartEnd, setChartEnd] = React.useState<string>(toIsoDate(today))
  const [chartSymbols, setChartSymbols] = React.useState<string[]>([])
  const [availableSymbols, setAvailableSymbols] = React.useState<string[]>([])
  const [loadingOhlc, setLoadingOhlc] = React.useState(false)
  const [ohlcEvents, setOhlcEvents] = React.useState<AdageEvent[] | null>(null)

  const [mode, setMode] = React.useState<"ohlc" | "non_ohlc">("ohlc")
  const [derivedTypes, setDerivedTypes] = React.useState<string[]>([])

  const [listStart, setListStart] = React.useState<string>(
    toIsoDate(defaultStart)
  )
  const [listEnd, setListEnd] = React.useState<string>(toIsoDate(today))
  const [listSymbols, setListSymbols] = React.useState<string[]>([])
  const [listEventTypes, setListEventTypes] = React.useState<string[]>([])
  const [loadingList, setLoadingList] = React.useState(false)
  const [listEvents, setListEvents] = React.useState<AdageEvent[] | null>(null)

  const [editingName, setEditingName] = React.useState("")
  const [editingDesc, setEditingDesc] = React.useState("")
  const [savingMeta, setSavingMeta] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const [ingestExchange, setIngestExchange] = React.useState("XNAS")
  const [ingestSymbolsRaw, setIngestSymbolsRaw] = React.useState("")
  const [ingestFrom, setIngestFrom] = React.useState<string>(
    toIsoDate(defaultStart)
  )
  const [ingestTo, setIngestTo] = React.useState<string>(toIsoDate(today))
  const [ingesting, setIngesting] = React.useState(false)
  const [ingestResult, setIngestResult] =
    React.useState<FetchEventsResponse | null>(null)

  const [modelId, setModelId] = React.useState("")
  const [asOf, setAsOf] = React.useState("")
  const [gridExposedRaw, setGridExposedRaw] = React.useState("")
  const [training, setTraining] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [mangoEnabled, setMangoEnabled] = React.useState(true)
  const [trainResult, setTrainResult] = React.useState<TrainResponse | null>(
    null
  )
  const [runResult, setRunResult] = React.useState<RunResponse | null>(null)
  const [metaEditMode, setMetaEditMode] = React.useState(false)
  const [gridOverlayEnabled, setGridOverlayEnabled] = React.useState(true)
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  const metaDirty = Boolean(
    meta &&
    (editingName.trim() !== (meta.name ?? "").trim() ||
      editingDesc.trim() !== (meta.description ?? "").trim())
  )

  React.useEffect(() => {
    if (metaEditMode) titleInputRef.current?.focus()
  }, [metaEditMode])

  function cancelMetaEdit() {
    setEditingName(meta?.name ?? "")
    setEditingDesc(meta?.description ?? "")
    setMetaEditMode(false)
  }

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(prefsKey)
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (typeof parsed.chartStart === "string")
        setChartStart(parsed.chartStart)
      if (typeof parsed.chartEnd === "string") setChartEnd(parsed.chartEnd)
      if (Array.isArray(parsed.chartSymbols))
        setChartSymbols(parsed.chartSymbols.map(String))
      if (typeof parsed.listStart === "string") setListStart(parsed.listStart)
      if (typeof parsed.listEnd === "string") setListEnd(parsed.listEnd)
    } catch {
      // ignore
    }
  }, [prefsKey])

  React.useEffect(() => {
    try {
      localStorage.setItem(
        prefsKey,
        JSON.stringify({
          chartStart,
          chartEnd,
          chartSymbols,
          listStart,
          listEnd,
        })
      )
    } catch {
      // ignore
    }
  }, [prefsKey, chartStart, chartEnd, chartSymbols, listStart, listEnd])

  async function loadMeta() {
    if (!datasetId) return
    setLoadingMeta(true)
    try {
      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetId)}`)
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load dataset")
        return
      }
      const m = json as DatasetMeta
      setMeta(m)
      setEditingName(m.name ?? "")
      setEditingDesc(m.description ?? "")
    } finally {
      setLoadingMeta(false)
    }
  }

  async function loadStats() {
    if (!datasetId) return
    setLoadingStats(true)
    try {
      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}/events/stats`
      )
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load event stats")
        return
      }
      const st = json as EventStats
      setStats(st)

      const types = Object.keys(st.event_type_counts ?? {}).filter(
        (t) => t !== "stock_ohlc"
      )
      types.sort()
      setDerivedTypes(types)
      if (mode === "non_ohlc" && !listEventTypes.length && types.length) {
        setListEventTypes(types)
      }
    } finally {
      setLoadingStats(false)
    }
  }

  async function loadOhlcEvents() {
    if (!datasetId) return
    setLoadingOhlc(true)
    try {
      const qs = new URLSearchParams()
      qs.set("event_type", "stock_ohlc")
      qs.set("order", "ASC")
      qs.set("sort", "time")
      qs.set("limit", "1000")
      if (chartStart) qs.set("start_date", chartStart)
      if (chartEnd) qs.set("end_date", chartEnd)
      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}/events?${qs.toString()}`
      )
      const json = (await res.json().catch(() => null)) as EventsResponse | null
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load OHLC events")
        setOhlcEvents(null)
        return
      }
      const evs = json?.dataset?.events ?? []
      setOhlcEvents(evs)

      const unique = new Set<string>()
      for (const ev of evs) {
        const s =
          typeof ev.attribute?.symbol === "string" ? ev.attribute.symbol : ""
        if (s) unique.add(s)
      }
      const all = [...unique].sort()
      setAvailableSymbols((prev) => [...new Set([...prev, ...all])].sort())
      if (!chartSymbols.length && all.length) setChartSymbols(all.slice(0, 3))
    } finally {
      setLoadingOhlc(false)
    }
  }

  async function loadListEvents() {
    if (!datasetId) return
    setLoadingList(true)
    try {
      const qs = new URLSearchParams()
      qs.set("order", "DESC")
      qs.set("sort", "time")
      qs.set("limit", "200")
      if (listStart) qs.set("start_date", listStart)
      if (listEnd) qs.set("end_date", listEnd)
      if (listSymbols.length) qs.set("companies", listSymbols.join(","))

      if (mode === "ohlc") {
        qs.set("event_type", "stock_ohlc")
      } else {
        // Backend supports a single event_type, so we fetch "all" and filter client-side.
        // This keeps UX aligned with a multi-select derived type filter.
      }

      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}/events?${qs.toString()}`
      )
      const json = (await res.json().catch(() => null)) as EventsResponse | null
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load events")
        setListEvents(null)
        return
      }
      let evs = json?.dataset?.events ?? []
      if (mode === "non_ohlc") {
        const allowed = new Set(
          listEventTypes.length ? listEventTypes : derivedTypes
        )
        evs = evs.filter(
          (e) => e.event_type !== "stock_ohlc" && allowed.has(e.event_type)
        )
      }
      setListEvents(evs)
    } finally {
      setLoadingList(false)
    }
  }

  React.useEffect(() => {
    setAvailableSymbols([])
    loadMeta().catch(() => {})
    loadStats().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      loadOhlcEvents().catch(() => {})
    }, 300)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId, chartStart, chartEnd, chartSymbols])

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      loadListEvents().catch(() => {})
    }, 300)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    datasetId,
    mode,
    listStart,
    listEnd,
    listSymbols,
    listEventTypes,
    derivedTypes,
  ])

  const { seriesSymbols, rows } = React.useMemo(() => {
    if (!ohlcEvents)
      return { seriesSymbols: [] as string[], rows: [] as ChartRow[] }
    const { symbols: allSymbols, rows } = buildSeries(ohlcEvents)
    const used = chartSymbols.length
      ? allSymbols.filter((s) => chartSymbols.includes(s))
      : allSymbols

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

    return { seriesSymbols: used, rows: trimmed }
  }, [ohlcEvents, chartSymbols])

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

  async function saveMetadata(): Promise<boolean> {
    setSavingMeta(true)
    try {
      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: editingName.trim() || undefined,
            description: editingDesc.trim() || undefined,
          }),
        }
      )
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to update dataset")
        return false
      }
      toast.success("Dataset updated.")
      await loadMeta()
      return true
    } finally {
      setSavingMeta(false)
    }
  }

  async function deleteDataset() {
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}`,
        {
          method: "DELETE",
        }
      )
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to delete dataset")
        return
      }
      toast.success("Dataset deleted.")
      router.push("/app")
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  async function ingest() {
    const symbols = ingestSymbolsRaw
      .split(/[\s,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)

    if (!symbols.length || !ingestExchange.trim()) return

    setIngesting(true)
    setIngestResult(null)
    try {
      const res = await fetch(
        `/api/datasets/${encodeURIComponent(datasetId)}/events`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            symbols,
            exchange: ingestExchange.trim(),
            date_from: ingestFrom || undefined,
            date_to: ingestTo || undefined,
          }),
        }
      )
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Ingestion failed")
        return
      }
      setIngestResult(json as FetchEventsResponse)
      toast.success("Ingestion complete.")
      await Promise.all([loadStats(), loadOhlcEvents(), loadListEvents()])
    } finally {
      setIngesting(false)
    }
  }

  function loadSavedModel() {
    try {
      const saved = JSON.parse(localStorage.getItem(MODEL_STORAGE_KEY) ?? "[]")
      if (Array.isArray(saved) && saved.length) setModelId(String(saved[0]))
    } catch {
      // ignore
    }
  }

  function saveModel(id: string) {
    try {
      const saved = JSON.parse(localStorage.getItem(MODEL_STORAGE_KEY) ?? "[]")
      const next = Array.isArray(saved) ? saved : []
      if (!next.includes(id)) next.unshift(id)
      localStorage.setItem(MODEL_STORAGE_KEY, JSON.stringify(next.slice(0, 10)))
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    if (modelId) return
    loadSavedModel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function train() {
    setTraining(true)
    setTrainResult(null)
    try {
      const res = await fetch("/api/tango/predict/models/train", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId,
          horizon_days: 7,
          spike_threshold: 0.05,
          ...(mangoEnabled ? { macro: { ...TRAIN_MACRO_WINDOW } } : {}),
        }),
      })
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Training failed")
        return
      }
      const rec = asRecord(json)
      if (!rec || typeof rec.model_id !== "string") {
        toast.error("Training succeeded but returned an unexpected payload.")
        return
      }
      const tr = json as TrainResponse
      setTrainResult(tr)
      setModelId(tr.model_id)
      saveModel(tr.model_id)
      toast.success("Model trained.")
      return tr.model_id
    } finally {
      setTraining(false)
    }
  }

  async function run(modelIdOverride?: string) {
    const useModelId = (modelIdOverride ?? modelId).trim()
    if (!useModelId) return false
    setRunning(true)
    setRunResult(null)
    try {
      const gridExposed = gridExposedRaw
        .split(/[\s,]+/g)
        .map((s) => s.trim())
        .filter(Boolean)

      const overlayOn = gridOverlayEnabled && gridExposed.length > 0

      const res = await fetch("/api/tango/predict/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId,
          model_id: useModelId,
          as_of_date: asOf.trim() || undefined,
          use_mango: mangoEnabled,
          grid_overlay: {
            enabled: overlayOn,
            grid_exposed_symbols: gridExposed,
          },
        }),
      })
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Run failed")
        return
      }
      const rec = asRecord(json)
      if (!rec || typeof rec.as_of !== "string") {
        toast.error("Run succeeded but returned an unexpected payload.")
        return
      }
      setRunResult(json as RunResponse)
      toast.success("Spike risk updated.")
      return true
    } finally {
      setRunning(false)
    }
  }

  async function trainAndRun() {
    const id = await train()
    if (id) await run(id)
  }

  const hasSeries = rows.length > 1 && seriesSymbols.length > 0

  return (
    <div className="w-full space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start gap-2">
          {loadingMeta && !meta ? (
            <LoadingSpinner
              className="h-9 w-48 p-0"
              label="Loading dataset metadata"
            />
          ) : (
            <Input
              ref={titleInputRef}
              className={cn(
                "h-9 min-w-0 flex-1 text-xl font-semibold tracking-tight md:text-xl",
                metaEditMode
                  ? "border-input bg-input/20 px-2"
                  : "border-transparent bg-transparent px-0 shadow-none"
              )}
              readOnly={!metaEditMode}
              value={editingName || datasetId}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && metaEditMode) {
                  e.preventDefault()
                  cancelMetaEdit()
                }
              }}
              placeholder="Dataset name"
              aria-label="Dataset name"
            />
          )}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant={metaEditMode ? "default" : "outline"}
                  aria-label={
                    metaEditMode
                      ? savingMeta
                        ? "Saving"
                        : "Save dataset name and description"
                      : "Edit dataset name and description"
                  }
                  disabled={(loadingMeta && !meta) || savingMeta}
                  onClick={() => {
                    if (metaEditMode) {
                      if (metaDirty) {
                        saveMetadata()
                          .then((ok) => {
                            if (ok) setMetaEditMode(false)
                          })
                          .catch(() => {})
                      } else {
                        setMetaEditMode(false)
                      }
                    } else {
                      setMetaEditMode(true)
                    }
                  }}
                />
              }
            >
              {savingMeta ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : metaEditMode ? (
                <Save className="size-4" />
              ) : (
                <Pencil className="size-4" />
              )}
            </TooltipTrigger>
            <TooltipContent>
              {metaEditMode ? "Save dataset details" : "Edit dataset details"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Refresh dataset"
                  onClick={() => {
                    loadMeta().catch(() => {})
                    loadStats().catch(() => {})
                    loadOhlcEvents().catch(() => {})
                    loadListEvents().catch(() => {})
                    toast.message("Refreshing dataset…")
                  }}
                />
              }
            >
              <RefreshCw className="size-4" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>Refresh dataset</TooltipContent>
          </Tooltip>
          <Dialog>
            <Tooltip>
              <DialogTrigger
                render={
                  <TooltipTrigger
                    render={
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Delete dataset"
                      />
                    }
                  />
                }
              >
                <Trash2 className="size-4" />
              </DialogTrigger>
              <TooltipContent>Delete dataset</TooltipContent>
            </Tooltip>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete dataset</DialogTitle>
                <DialogDescription>
                  This permanently deletes the dataset and its stored events.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => deleteDataset().catch(() => {})}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete dataset"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Textarea
          value={editingDesc}
          readOnly={!metaEditMode}
          onChange={(e) => setEditingDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && metaEditMode) {
              e.preventDefault()
              cancelMetaEdit()
            }
          }}
          placeholder={
            metaEditMode
              ? "Describe this dataset…"
              : "No description yet. Use Edit to add one."
          }
          className={cn(
            "min-h-18 w-full resize-none text-sm",
            metaEditMode
              ? "border-input bg-input/20"
              : "border-transparent bg-transparent px-0 py-1 shadow-none"
          )}
          aria-label="Dataset description"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-1">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Add tickers</div>
              <div className="text-xs text-muted-foreground">
                Ingest raw OHLC events and generate deterministic derived
                events.
              </div>
            </div>
            <Button
              onClick={() => ingest().catch(() => {})}
              disabled={ingesting}
            >
              {ingesting ? "Ingesting…" : "Ingest"}
            </Button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Exchange</Label>
              <Select
                value={ingestExchange}
                onValueChange={(v) => setIngestExchange(v ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick exchange" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XNAS">XNAS (NASDAQ)</SelectItem>
                  <SelectItem value="XNYS">XNYS (NYSE)</SelectItem>
                  <SelectItem value="ASX">ASX</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="ingestSymbols">Symbols</Label>
              <Input
                id="ingestSymbols"
                value={ingestSymbolsRaw}
                onChange={(e) => setIngestSymbolsRaw(e.target.value)}
                placeholder="AAPL, MSFT, NVDA"
              />
              <div className="text-xs text-muted-foreground">
                Enter bare tickers separated by spaces or commas.
              </div>
            </div>
            <div className="space-y-2">
              <Label>From</Label>
              <DatePicker
                label="From date"
                value={ingestFrom}
                onValueChange={setIngestFrom}
              />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <DatePicker
                label="To date"
                value={ingestTo}
                onValueChange={setIngestTo}
              />
            </div>
          </div>

          {ingestResult ? (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">
                count: {ingestResult.count ?? 0}
              </Badge>
              <Badge variant="secondary">
                raw: {ingestResult.raw_event_count ?? 0}
              </Badge>
              <Badge variant="secondary">
                derived: {ingestResult.derived_event_count ?? 0}
              </Badge>
            </div>
          ) : null}
        </Card>
        <Card className="p-5 xl:col-span-2">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">Prediction engine</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Predict volatility spikes for attached tickers.
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">
                  Incorporate external signals from group APIs:
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="grid-overlay"
                      checked={gridOverlayEnabled}
                      onCheckedChange={(v) => setGridOverlayEnabled(v === true)}
                    />
                    <Label
                      htmlFor="grid-overlay"
                      className="text-xs leading-relaxed font-normal"
                    >
                      GridX - electricity-market shock signals by region.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="mango-enabled"
                      checked={mangoEnabled}
                      onCheckedChange={(v) => setMangoEnabled(v === true)}
                    />
                    <Label
                      htmlFor="mango-enabled"
                      className="text-xs leading-relaxed font-normal"
                    >
                      Mango - Macroeconomic indicators such as CPI and
                      unemployment context.
                    </Label>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => run().catch(() => {})}
                    disabled={!modelId.trim() || running || training}
                  >
                    {running ? "Running…" : "Run spike risk"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => trainAndRun().catch(() => {})}
                    disabled={training || running}
                  >
                    {training
                      ? "Training…"
                      : running
                        ? "Running…"
                        : "Train & run"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => train().catch(() => {})}
                    disabled={training || running}
                  >
                    Train only
                  </Button>
                </div>

                <div className="mt-4">
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button variant="outline" size="sm">
                          Advanced
                        </Button>
                      }
                    />
                    <PopoverContent className="w-80">
                      <div className="grid gap-3">
                        <div className="space-y-1">
                          <Label>Model ID</Label>
                          <Input
                            value={modelId}
                            onChange={(e) => setModelId(e.target.value)}
                            placeholder="model_..."
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>As-of (optional)</Label>
                          <Input
                            value={asOf}
                            onChange={(e) => setAsOf(e.target.value)}
                            placeholder="YYYY-MM-DD"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Grid-exposed symbols (optional)</Label>
                          <Input
                            value={gridExposedRaw}
                            onChange={(e) => setGridExposedRaw(e.target.value)}
                            placeholder="ORG.AX, AGL.AX"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-dashed p-4 lg:h-full">
              <div className="text-xs font-semibold">Training result</div>
              {trainResult ? (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div>
                    model_id:{" "}
                    <span className="font-mono">{trainResult.model_id}</span>
                  </div>
                  <div>AUC: {trainResult.metrics.auc.toFixed(3)}</div>
                  <div>
                    Precision: {trainResult.metrics.precision.toFixed(3)} ·
                    Recall: {trainResult.metrics.recall.toFixed(3)}
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted-foreground">
                  Train to generate a new model (needs enough history in this
                  dataset).
                </div>
              )}
            </div>
          </div>

          {runResult ? (
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground">
                as_of: <span className="font-mono">{runResult.as_of}</span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {runResult.predictions.map((p) => (
                  <div key={p.symbol} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xs">{p.symbol}</div>
                      <Badge
                        className={cn(
                          "text-[0.625rem]",
                          riskTone(p.risk_level)
                        )}
                      >
                        {p.risk_level}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      {pct(p.p_spike_7d)}
                    </div>
                    <div className="text-[0.625rem] text-muted-foreground">
                      P(7d spike ≥5% daily move)
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      drivers: {p.drivers?.join(", ") || "n/a"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="grid gap-4 2xl:grid-cols-3">
        <Card className="flex h-[40rem] min-h-0 flex-col overflow-hidden p-5 2xl:col-span-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">Charts</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Interactive OHLC plots. PNG is available as export/fallback.
                Filters apply automatically; use Refresh above for a full
                reload.
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <DatePicker
                label="Start date"
                value={chartStart}
                onValueChange={setChartStart}
              />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <DatePicker
                label="End date"
                value={chartEnd}
                onValueChange={setChartEnd}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Symbols</Label>
              <MultiSelect
                value={chartSymbols}
                onValueChange={setChartSymbols}
                placeholder="Pick symbols"
                options={availableSymbols}
                allowCustom
              />
            </div>
          </div>

          <div className="mt-4 flex min-h-0 flex-1 flex-col">
            <Tabs
              defaultValue="price"
              className="flex h-full min-h-0 flex-1 flex-col gap-0"
            >
              <TabsList className="shrink-0">
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
                <TabsTrigger value="png">Server PNG</TabsTrigger>
              </TabsList>

              <TabsContent
                value="price"
                className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden [[inert]]:hidden"
              >
                {loadingOhlc ? (
                  <LoadingSpinner
                    className="min-h-56"
                    label="Loading chart data"
                  />
                ) : !hasSeries ? (
                  <div className="text-sm text-muted-foreground">
                    No OHLC events found for this range.
                  </div>
                ) : (
                  <ChartContainer
                    className="aspect-auto h-full min-h-0 w-full flex-1"
                    config={closeCfg}
                  >
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
                )}
              </TabsContent>

              <TabsContent
                value="volume"
                className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden [[inert]]:hidden"
              >
                {loadingOhlc ? (
                  <LoadingSpinner
                    className="min-h-56"
                    label="Loading chart data"
                  />
                ) : !hasSeries ? (
                  <div className="text-sm text-muted-foreground">
                    No OHLC events found for this range.
                  </div>
                ) : (
                  <ChartContainer
                    className="aspect-auto h-full min-h-0 w-full flex-1"
                    config={volCfg}
                  >
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
                )}
              </TabsContent>

              <TabsContent
                value="returns"
                className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden [[inert]]:hidden"
              >
                {loadingOhlc ? (
                  <LoadingSpinner
                    className="min-h-56"
                    label="Loading chart data"
                  />
                ) : !hasSeries ? (
                  <div className="text-sm text-muted-foreground">
                    No OHLC events found for this range.
                  </div>
                ) : (
                  <ChartContainer
                    className="aspect-auto h-full min-h-0 w-full flex-1"
                    config={retCfg}
                  >
                    <LineChart data={rows}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="date" tickMargin={8} minTickGap={30} />
                      <YAxis
                        tickMargin={8}
                        width={64}
                        tickFormatter={(v) =>
                          typeof v === "number"
                            ? `${(v * 100).toFixed(0)}%`
                            : `${v}`
                        }
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      {seriesSymbols.map((sym, idx) => {
                        const key = `ret_${sanitizeKey(sym)}`
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
                )}
              </TabsContent>

              <TabsContent
                value="png"
                className="mt-3 flex min-h-0 flex-1 flex-col overflow-auto [[inert]]:hidden"
              >
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Server-rendered candlestick PNG (optional).
                  </div>
                  <div className="overflow-hidden rounded-lg border bg-card">
                    <Image
                      alt="Candlestick chart"
                      className="h-auto w-full"
                      width={1200}
                      height={700}
                      unoptimized
                      src={`/api/charts?${new URLSearchParams({
                        dataset_id: datasetId,
                        companies: chartSymbols.join(","),
                        start_date: chartStart,
                        end_date: chartEnd,
                        title: meta?.name
                          ? `${meta.name} Candlestick`
                          : "Candlestick",
                      }).toString()}`}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <Card className="flex h-[40rem] flex-col p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">Events</div>
              </div>
              <div className="text-xs text-muted-foreground">
                Browse OHLC and derived extractions with filters and CSV export.
                Filters apply automatically; use Refresh above for a full
                reload.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const qs = new URLSearchParams()
                  if (listStart) qs.set("start_date", listStart)
                  if (listEnd) qs.set("end_date", listEnd)
                  if (listSymbols.length)
                    qs.set("companies", listSymbols.join(","))
                  if (mode === "ohlc") qs.set("event_type", "stock_ohlc")
                  const url = `/api/datasets/${encodeURIComponent(datasetId)}/export?${qs.toString()}`
                  window.open(url, "_blank", "noopener,noreferrer")
                }}
              >
                Export CSV
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={mode === "ohlc" ? "default" : "outline"}
              onClick={() => setMode("ohlc")}
            >
              OHLC
            </Button>
            <Button
              size="sm"
              variant={mode === "non_ohlc" ? "default" : "outline"}
              onClick={() => setMode("non_ohlc")}
            >
              Non-OHLC
            </Button>
            <div className="ml-auto">
              {loadingStats && !stats ? (
                <LoadingSpinner
                  className="h-6 p-0"
                  label="Loading event stats"
                />
              ) : stats ? (
                <Badge variant="secondary" className="text-[0.625rem]">
                  total: {stats.total_events ?? 0}
                </Badge>
              ) : null}
            </div>
          </div>

          {mode === "non_ohlc" ? (
            <div className="mt-3">
              <MultiSelect
                value={listEventTypes}
                onValueChange={setListEventTypes}
                placeholder="Derived types"
                options={derivedTypes}
                allowCustom={false}
              />
            </div>
          ) : null}

          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <DatePicker
                label="Start date"
                value={listStart}
                onValueChange={setListStart}
              />
            </div>
            <div className="space-y-2">
              <Label>End</Label>
              <DatePicker
                label="End date"
                value={listEnd}
                onValueChange={setListEnd}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Symbols</Label>
              <MultiSelect
                value={listSymbols}
                onValueChange={setListSymbols}
                placeholder="Pick symbols"
                options={availableSymbols}
                allowCustom
              />
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-auto">
            {loadingList && !listEvents ? (
              <LoadingSpinner className="min-h-56" label="Loading events" />
            ) : !listEvents || listEvents.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No events for this selection.
              </div>
            ) : (
              <div className="space-y-2 pr-1">
                {listEvents.slice(0, 200).map((e, idx) => {
                  const sym =
                    typeof e.attribute?.symbol === "string"
                      ? e.attribute.symbol
                      : null
                  const ts = e.time_object?.timestamp ?? ""
                  return (
                    <div
                      key={`${ts}:${e.event_type}:${idx}`}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{e.event_type}</Badge>
                            {sym ? (
                              <span className="font-mono text-xs">{sym}</span>
                            ) : null}
                          </div>
                          <div className="mt-1 truncate text-[0.625rem] text-muted-foreground">
                            {ts}
                          </div>
                        </div>
                      </div>
                      <pre className="mt-2 overflow-auto rounded-md bg-muted/40 p-2 text-[0.625rem] leading-relaxed text-muted-foreground">
                        {JSON.stringify(e.attribute ?? {}, null, 2)}
                      </pre>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
