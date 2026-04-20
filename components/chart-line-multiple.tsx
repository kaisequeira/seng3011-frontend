"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A multiple line chart"

const chartData = [
  { month: "Jan", ingest: 120, retrieve: 420 },
  { month: "Feb", ingest: 180, retrieve: 510 },
  { month: "Mar", ingest: 210, retrieve: 480 },
  { month: "Apr", ingest: 165, retrieve: 560 },
  { month: "May", ingest: 240, retrieve: 620 },
  { month: "Jun", ingest: 275, retrieve: 590 },
]

const chartConfig = {
  ingest: {
    label: "Ingest",
    color: "var(--chart-1)",
  },
  retrieve: {
    label: "Retrieve",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartLineMultiple() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Gateway traffic</CardTitle>
        <CardDescription>
          Illustrative ingest vs retrieve volume (demo series)
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ left: 12, right: 12 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="ingest"
              type="monotone"
              stroke="var(--color-ingest)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="retrieve"
              type="monotone"
              stroke="var(--color-retrieve)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Combined API activity trending up <TrendingUp className="size-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Pair with the area chart for a full picture of the combined gateway.
        </div>
      </CardFooter>
    </Card>
  )
}
