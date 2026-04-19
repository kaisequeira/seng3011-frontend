import Link from "next/link"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function AppHomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to TANGO
        </h1>
        <p className="text-sm text-muted-foreground">
          Explore datasets, build charts from ADAGE events, and run next-7-day
          volatility spike forecasts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Datasets</div>
            <Badge variant="secondary">Retrieve</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse and inspect dataset metadata and events.
          </p>
          <div className="mt-4">
            <Link href="/app/datasets">
              <Button size="sm" variant="outline">
                View datasets
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Charts</div>
            <Badge variant="secondary">Interactive</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Render Recharts from OHLC events (close/volume/returns).
          </p>
          <div className="mt-4">
            <Link href="/app/charts">
              <Button size="sm" variant="outline">
                Open charts
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Predict</div>
            <Badge variant="secondary">Spike risk</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Train a pooled logistic regression model and run forecasts.
          </p>
          <div className="mt-4">
            <Link href="/app/predict">
              <Button size="sm" variant="outline">
                Open predictor
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Export</div>
            <Badge variant="secondary">Optional</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Use server-rendered PNG charts as a fallback/export.
          </p>
          <div className="mt-4">
            <Link href="/app/charts#png">
              <Button size="sm" variant="outline">
                PNG export
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
