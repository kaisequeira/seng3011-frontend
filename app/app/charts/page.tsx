import * as React from "react"

import { ChartsExplorer } from "@/components/charts/charts-explorer"

export default function ChartsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="text-sm text-muted-foreground">Loading charts…</div>
      }
    >
      <ChartsExplorer />
    </React.Suspense>
  )
}
