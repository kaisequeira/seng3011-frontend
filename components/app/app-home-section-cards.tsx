import {
  IconDatabase,
  IconLayersSubtract,
  IconRadar2,
  IconStack2,
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

type Props = {
  datasetCount: number
  totalEvents: number
  sampledDatasets: number
}

export function AppHomeSectionCards({
  datasetCount,
  totalEvents,
  sampledDatasets,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Datasets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {datasetCount}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconDatabase className="size-3.5" />
              Workspace
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">In this account</div>
          <div className="text-muted-foreground">
            Open one from the table or create a new dataset from the sidebar.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Events (sampled)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalEvents >= 0 ? totalEvents.toLocaleString() : "—"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconStack2 className="size-3.5" />
              ADAGE
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Sum over up to four datasets</div>
          <div className="text-muted-foreground">
            Full stats live on each dataset page.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Coverage</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {sampledDatasets}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconLayersSubtract className="size-3.5" />
              Stats load
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Datasets with event stats fetched</div>
          <div className="text-muted-foreground">
            Loaded in parallel on dashboard entry.
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card" data-slot="card">
        <CardHeader>
          <CardDescription>Forecast</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            7d spike
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconRadar2 className="size-3.5" />
              Predict
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Train &amp; run on a dataset</div>
          <div className="text-muted-foreground">
            Mango macro + GridX shock overlays on the dataset page.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
