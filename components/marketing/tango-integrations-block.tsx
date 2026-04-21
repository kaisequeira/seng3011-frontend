import {
  Activity,
  ArrowRight,
  BatteryCharging,
  ChartNoAxesCombined,
  Factory,
  Sparkles,
} from "lucide-react"

import { Integration9 } from "@/components/integration9"
import { Card } from "@/components/ui/card"

function badgeDataUri(label: string, bg: string, fg = "#111827") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="18" fill="${bg}"/><text x="36" y="43" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="${fg}">${label}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const data = [
  {
    id: 1,
    icon: badgeDataUri("MG", "#ffe8b5"),
    title: "Team Mango",
    description:
      "CPI and unemployment regime features feed predictive training so the model understands broad macro conditions, not just ticker momentum.",
  },
  {
    id: 2,
    icon: badgeDataUri("GX", "#dbeafe"),
    title: "GridX",
    description:
      "Electricity shock forecasts overlay near-term stress on grid-exposed names and turn market monitoring into a more actionable watchlist signal.",
  },
  {
    id: 3,
    icon: badgeDataUri("PE", "#dcfce7"),
    title: "TANGO predictive engine",
    description:
      "A pooled logistic regression model combines OHLC features with overlays to estimate spike probability and return the strongest drivers.",
  },
  {
    id: 4,
    icon: badgeDataUri("OUT", "#f3e8ff"),
    title: "Combined forecast output",
    description:
      "OHLC events + macro regime inputs + electricity overlay become a risk score, risk band, and explanation that users can actually act on.",
  },
]

const pipelineSteps = [
  {
    title: "OHLC event stream",
    description:
      "Structured daily price events and derived signals per dataset.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Macro regime layer",
    description:
      "Mango CPI and unemployment features reshape the risk backdrop.",
    icon: Activity,
  },
  {
    title: "Electricity overlay",
    description:
      "GridX shock scores lift urgency for energy and utility exposure.",
    icon: BatteryCharging,
  },
  {
    title: "Actionable forecast",
    description: "TANGO returns spike probability, severity, and key drivers.",
    icon: Factory,
  },
]

export function TangoIntegrationsBlock() {
  return (
    <section className="flex flex-col items-center justify-center py-16">
      <div data-reveal className="container mb-8">
        <p className="mb-3 text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Live integrations
        </p>
        <h2 className="max-w-3xl text-4xl font-semibold tracking-tight lg:text-5xl">
          TANGO gets better when the outside world pushes back.
        </h2>
      </div>

      <Integration9
        title="Integrations that make the forecast smarter"
        data={data}
        className="w-full"
      />

      <div className="container mt-10">
        <Card
          data-reveal
          className="overflow-hidden border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(244,247,255,0.72))] p-6 shadow-xl shadow-sky-100/40 dark:bg-[linear-gradient(135deg,rgba(24,24,27,0.95),rgba(24,24,27,0.82))] dark:shadow-black/20"
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
                Predictive pipeline
              </p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">
                A real signal chain, not a decorative trend card.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Each layer contributes a specific view of stress. TANGO
                normalizes the data, weights the context, and turns it into a
                score your team can watch, hedge against, or promote to alerts.
              </p>

              <div
                data-pipeline
                className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
              >
                {pipelineSteps.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.title}
                      data-pipeline-step
                      className="relative rounded-3xl border border-white/20 bg-background/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="grid size-12 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200">
                          <Icon className="size-5" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          0{index + 1}
                        </span>
                      </div>
                      <h4 className="mt-4 text-lg font-semibold">
                        {step.title}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {step.description}
                      </p>
                      {index < pipelineSteps.length - 1 ? (
                        <ArrowRight className="pointer-events-none absolute top-1/2 -right-2 hidden size-4 -translate-y-1/2 text-muted-foreground/60 xl:block" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>

            <div
              data-pipeline-output
              className="relative overflow-hidden rounded-[2rem] border border-sky-200/30 bg-[linear-gradient(155deg,#0f172a_0%,#111827_46%,#10243e_100%)] p-6 text-white shadow-2xl shadow-slate-950/20 dark:border-sky-300/10"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(253,224,71,0.16),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.14),transparent_30%)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-[0.28em] text-white/60 uppercase">
                      Output layer
                    </p>
                    <h4 className="mt-3 text-2xl font-semibold tracking-tight">
                      Next-7-day spike risk
                    </h4>
                  </div>
                  <span
                    data-risk-level
                    className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-medium text-amber-200"
                  >
                    Elevated
                  </span>
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-white/70">Probability</span>
                    <span
                      data-risk-percentage
                      className="text-4xl font-semibold tabular-nums"
                    >
                      23.4%
                    </span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white/10">
                    <div
                      data-risk-fill
                      className="h-full w-[23%] rounded-full bg-sky-300"
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/80">
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      Mango regime shift
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1">
                      NSW shock score 0.74
                    </span>
                  </div>
                </div>
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/6 p-4">
                  <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                    <Sparkles className="size-4 text-sky-200" />
                  </div>
                  <p className="text-sm leading-6 text-white/72">
                    The score is paired with drivers, not hidden behind the
                    model, so users can see why the forecast moved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
