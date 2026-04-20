import {
  IconChartBar,
  IconDatabase,
  IconRadar2,
  IconShieldLock,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function TangoMarketingSectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Dataset workspace</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ADAGE events
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconDatabase className="size-3.5" />
              Ingest
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-2 font-medium">
            Create datasets, attach tickers, and keep extractions in one
            scrollable page.
          </div>
          <div className="text-muted-foreground">
            Dataset-first workflow end to end.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Exploration</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Charts + filters
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconChartBar className="size-3.5" />
              Live
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-2 font-medium">
            Recharts-backed visuals from real retrieval—no static PNGs.
          </div>
          <div className="text-muted-foreground">
            Fast filters across event types and time.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Predictive risk</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            7-day horizon
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconRadar2 className="size-3.5" />
              Spike p
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-2 font-medium">
            Train and run volatility spike probability with explainable drivers.
          </div>
          <div className="text-muted-foreground">
            Macro + grid overlays inform the forecast.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Security</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Cognito + cookies
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconShieldLock className="size-3.5" />
              JWT
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-2 font-medium">
            Sessions via HTTP-only cookies—no tokens in localStorage.
          </div>
          <div className="text-muted-foreground">
            Combined gateway for auth, data, and predict.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
