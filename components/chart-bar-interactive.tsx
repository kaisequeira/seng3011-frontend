"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive bar chart"

const chartData = [
  { route: "datasets", count: 186 },
  { route: "events", count: 305 },
  { route: "charts", count: 237 },
  { route: "predict", count: 173 },
  { route: "auth", count: 98 },
]

const chartConfig = {
  count: {
    label: "Requests",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartBarInteractive() {
  const [range, setRange] = React.useState<"all" | "top">("all")
  const data =
    range === "top"
      ? [...chartData].sort((a, b) => b.count - a.count).slice(0, 3)
      : chartData

  return (
    <Card className="@container/card">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Requests by route family</CardTitle>
          <CardDescription>
            Illustrative distribution across TANGO gateway surfaces
          </CardDescription>
        </div>
        <Select
          value={range}
          onValueChange={(v) => setRange(v as "all" | "top")}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            <SelectItem value="top">Top 3</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[220px] w-full"
        >
          <BarChart
            data={data}
            accessibilityLayer
            margin={{ left: 8, right: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="route"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
