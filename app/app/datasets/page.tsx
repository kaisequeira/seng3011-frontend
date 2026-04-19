"use client"

import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

type DatasetMeta = {
  dataset_id: string
  name?: string
  description?: string
  dataset_type?: string
  data_source?: string
}

export default function DatasetsPage() {
  const [datasets, setDatasets] = React.useState<DatasetMeta[] | null>(null)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  async function load() {
    const res = await fetch("/api/datasets")
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      toast.error(json?.message ?? "Failed to load datasets")
      return
    }
    setDatasets(Array.isArray(json) ? (json as DatasetMeta[]) : [])
  }

  React.useEffect(() => {
    load().catch(() => {})
  }, [])

  async function create() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.message ?? "Failed to create dataset")
        return
      }
      toast.success("Dataset created.")
      setName("")
      setDescription("")
      await load()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Datasets</h1>
          <p className="text-sm text-muted-foreground">
            Create datasets, then ingest OHLC events via the TANGO API.
          </p>
        </div>
        <Link href="/app/charts">
          <Button variant="secondary">Open charts</Button>
        </Link>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tech stocks Q1 2026"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => create().catch(() => {})}
            disabled={!name.trim() || creating}
          >
            {creating ? "Creating..." : "Create dataset"}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        {!datasets ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No datasets yet. Create one above.
          </div>
        ) : (
          <div className="space-y-2">
            {datasets.map((d) => (
              <div
                key={d.dataset_id}
                className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">
                    {d.name ?? d.dataset_id}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {d.dataset_id}
                  </div>
                  {d.description ? (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {d.description}
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/app/charts?dataset=${encodeURIComponent(d.dataset_id)}`}
                  >
                    <Button size="sm" variant="outline">
                      Charts
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
