import { IconBolt, IconChartPie } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TangoIntegrationsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:grid-cols-2 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card" data-slot="card">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">Team Mango</CardTitle>
            <CardDescription>
              Australian macroeconomic regime features for spike-risk training.
            </CardDescription>
          </div>
          <Badge variant="secondary">Macro regime</Badge>
        </CardHeader>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
              <IconChartPie className="size-5" />
            </div>
            <p>
              CPI and unemployment are forward-filled to daily cadence to reduce
              false positives across macro cycles.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
              <IconChartPie className="size-5" />
            </div>
            <p>
              Probability comes with a drivers-style explanation—not only a
              trend chart.
            </p>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card" data-slot="card">
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base">GridX</CardTitle>
            <CardDescription>
              Near-term electricity price shock overlay for grid-exposed
              symbols.
            </CardDescription>
          </div>
          <Badge variant="secondary">Shock overlay</Badge>
        </CardHeader>
        <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
              <IconBolt className="size-5" />
            </div>
            <p>
              TANGO fetches a real-time shock score per region and applies a
              monotonic probability boost for selected symbols.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-xs">
            <div className="font-mono text-muted-foreground">
              OHLC + Mango macro + GridX shock → p(spike in 7d) + drivers
            </div>
            <p className="mt-2 text-muted-foreground">
              Informational decision support only. Not financial advice.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
