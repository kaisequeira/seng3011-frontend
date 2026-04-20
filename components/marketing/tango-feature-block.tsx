import {
  AreaChart,
  ChartCandlestick,
  DatabaseZap,
  FolderKanban,
  Radar,
  ShieldCheck,
} from "lucide-react"

import { Feature43 } from "@/components/feature43"

const features = [
  {
    heading: "ADAGE 3.0 normalized events",
    description:
      "Convert raw OHLC data into consistent event payloads that downstream teams can query, chart, and export without writing Yahoo Finance glue code.",
    icon: <DatabaseZap className="size-6" />,
  },
  {
    heading: "Interactive charts + PNG fallback",
    description:
      "Explore close, return, and volume series in the UI while still keeping the backend chart route available for export and compatibility workflows.",
    icon: <ChartCandlestick className="size-6" />,
  },
  {
    heading: "Predictive volatility spike scoring",
    description:
      "Forecast next-7-day spike probability using pooled logistic regression with explainable drivers instead of just another trend line.",
    icon: <Radar className="size-6" />,
  },
  {
    heading: "Grouped datasets for portfolios",
    description:
      "Create reusable workspaces for watchlists, sectors, or client portfolios and keep ingestion, exploration, and prediction attached to the same dataset.",
    icon: <FolderKanban className="size-6" />,
  },
  {
    heading: "Exports ready for downstream analytics",
    description:
      "Move from retrieval to CSV export and derived event analysis quickly, whether the consumer is a dashboard, notebook, or another event intelligence service.",
    icon: <AreaChart className="size-6" />,
  },
  {
    heading: "Cognito-secured multi-service gateway",
    description:
      "Use one authenticated frontend surface for auth, datasets, charts, and prediction while keeping the backend modular across AWS services.",
    icon: <ShieldCheck className="size-6" />,
  },
]

export function TangoFeatureBlock() {
  return (
    <Feature43
      title="Everything the TANGO stack does once the data starts moving"
      features={features}
      buttonText="Open Swagger docs"
      buttonUrl="/api/docs"
      className="flex flex-col items-center justify-center"
    />
  )
}
