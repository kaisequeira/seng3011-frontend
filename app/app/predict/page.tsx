"use client"

import * as React from "react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    risk_level: string
    drivers: string[]
  }[]
}

type GridShockResponse = {
  generated_at: string
  regions: {
    region: string
    current_price: number
    price_30m: number
    shock_score: number
    level: string
  }[]
}

const STORAGE_KEY = "tango_models_v1"

function asRecord(x: unknown): Record<string, unknown> | null {
  return typeof x === "object" && x !== null
    ? (x as Record<string, unknown>)
    : null
}

function messageFrom(x: unknown): string | null {
  const rec = asRecord(x)
  return rec && typeof rec.message === "string" ? rec.message : null
}

export default function PredictPage() {
  const [datasetId, setDatasetId] = React.useState("")
  const [modelId, setModelId] = React.useState("")
  const [asOf, setAsOf] = React.useState("")
  const [gridExposedRaw, setGridExposedRaw] = React.useState("")

  const [training, setTraining] = React.useState(false)
  const [running, setRunning] = React.useState(false)
  const [trainResult, setTrainResult] = React.useState<TrainResponse | null>(
    null
  )
  const [runResult, setRunResult] = React.useState<RunResponse | null>(null)

  // tiny “model registry” for UX; upstream currently returns only model_id.
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
      if (Array.isArray(saved) && saved.length && !modelId)
        setModelId(String(saved[0]))
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function saveModel(id: string) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
      const next = Array.isArray(saved) ? saved : []
      if (!next.includes(id)) next.unshift(id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 10)))
    } catch {
      // ignore
    }
  }

  async function train() {
    if (!datasetId.trim()) return
    setTraining(true)
    setTrainResult(null)
    try {
      const res = await fetch("/api/tango/predict/models/train", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId.trim(),
          horizon_days: 7,
          spike_threshold: 0.05,
          macro: {
            cpi_start: "2023-Q1",
            cpi_end: "2026-Q1",
            unemp_start: "2023-01",
            unemp_end: "2026-03",
          },
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
    } finally {
      setTraining(false)
    }
  }

  async function run() {
    if (!datasetId.trim() || !modelId.trim()) return
    setRunning(true)
    setRunResult(null)
    try {
      const gridExposed = gridExposedRaw
        .split(/[\s,]+/g)
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await fetch("/api/tango/predict/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dataset_id: datasetId.trim(),
          model_id: modelId.trim(),
          as_of_date: asOf.trim() || undefined,
          grid_overlay: gridExposed.length
            ? { enabled: true, grid_exposed_symbols: gridExposed }
            : { enabled: false, grid_exposed_symbols: [] },
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
      toast.success("Forecast generated.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Predictive Risk
        </h1>
        <p className="text-sm text-muted-foreground">
          Next-7-day volatility spike probability per ticker (pooled logistic
          regression).
        </p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="ds">Dataset ID</Label>
            <Input
              id="ds"
              value={datasetId}
              onChange={(e) => setDatasetId(e.target.value)}
              placeholder="dataset_..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mid">Model ID</Label>
            <Input
              id="mid"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="model_..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="asof">As-of date (optional)</Label>
            <Input
              id="asof"
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Train</div>
            <Button
              onClick={() => train().catch(() => {})}
              disabled={!datasetId.trim() || training}
            >
              {training ? "Training..." : "Train model"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Uses OHLC-derived features, and attempts to include Mango CPI +
            unemployment as macro regime features.
          </p>
          {trainResult ? (
            <div className="mt-4 space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">model_id:</span>{" "}
                <span className="font-mono">{trainResult.model_id}</span>
              </div>
              <div className="text-muted-foreground">
                AUC: {trainResult.metrics.auc.toFixed(3)}
              </div>
              <div className="text-muted-foreground">
                Precision: {trainResult.metrics.precision.toFixed(3)} · Recall:{" "}
                {trainResult.metrics.recall.toFixed(3)}
              </div>
              <div className="text-muted-foreground">
                Features: {trainResult.feature_list.join(", ")}
              </div>
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Run</div>
            <Button
              onClick={() => run().catch(() => {})}
              disabled={!datasetId.trim() || !modelId.trim() || running}
            >
              {running ? "Running..." : "Run forecast"}
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Optional grid overlay: apply the GridX shock score to
            energy/utility-exposed symbols.
          </p>
          <div className="mt-3 space-y-2">
            <Label htmlFor="grid">
              Grid-exposed symbols (comma/space separated)
            </Label>
            <Textarea
              id="grid"
              value={gridExposedRaw}
              onChange={(e) => setGridExposedRaw(e.target.value)}
              placeholder="e.g. AGL.AX ORIGIN.AX ..."
            />
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <Tabs defaultValue="preds">
          <TabsList>
            <TabsTrigger value="preds">Predictions</TabsTrigger>
            <TabsTrigger value="grid">Electricity shock</TabsTrigger>
          </TabsList>

          <TabsContent value="preds" className="mt-4">
            {!runResult ? (
              <div className="text-sm text-muted-foreground">
                Run a forecast to see probabilities.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  as_of: {runResult.as_of}
                </div>
                <div className="space-y-2">
                  {runResult.predictions.map((p) => (
                    <div key={p.symbol} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-mono text-sm">{p.symbol}</div>
                        <div className="text-sm font-semibold">
                          {(p.p_spike_7d * 100).toFixed(1)}% ·{" "}
                          <span className="text-muted-foreground">
                            {p.risk_level}
                          </span>
                        </div>
                      </div>
                      {p.drivers?.length ? (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {p.drivers.join(" · ")}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid" className="mt-4">
            <GridShock />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

function GridShock() {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<GridShockResponse | null>(null)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/tango/predict/electricity-shock")
      const json = (await res.json().catch(() => null)) as unknown
      if (!res.ok) {
        toast.error(messageFrom(json) ?? "Failed to load shock forecast")
        return
      }
      const rec = asRecord(json)
      if (
        !rec ||
        typeof rec.generated_at !== "string" ||
        !Array.isArray(rec.regions)
      ) {
        toast.error("Unexpected shock payload.")
        return
      }
      setData(json as GridShockResponse)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load().catch(() => {})
  }, [])

  if (loading && !data)
    return <div className="text-sm text-muted-foreground">Loading…</div>
  if (!data)
    return <div className="text-sm text-muted-foreground">No data.</div>

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">
        generated_at: {data.generated_at}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {(data.regions ?? []).map((r) => (
          <div key={r.region} className="rounded-lg border p-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-semibold">{r.region}</div>
              <div className="text-xs text-muted-foreground">{r.level}</div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">current</div>
                <div className="font-mono">{r.current_price}</div>
              </div>
              <div>
                <div className="text-muted-foreground">+30m</div>
                <div className="font-mono">{r.price_30m}</div>
              </div>
              <div>
                <div className="text-muted-foreground">shock</div>
                <div className="font-mono">{r.shock_score}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() => load().catch(() => {})}
        disabled={loading}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  )
}
