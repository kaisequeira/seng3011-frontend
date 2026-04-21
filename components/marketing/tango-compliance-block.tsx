import { LockKeyhole, Shapes, ShieldCheck } from "lucide-react"

import { Card } from "@/components/ui/card"

const trustPillars = [
  {
    title: "ADAGE-first structure",
    description:
      "Datasets, derived events, and exports share one language so everything downstream is easier to integrate.",
    icon: Shapes,
  },
  {
    title: "Cognito-backed auth",
    description:
      "Users move through the product with proper session handling instead of improvised client-side auth state.",
    icon: LockKeyhole,
  },
  {
    title: "CI / CD tested surface",
    description:
      "Frontend checks, backend collections, and deploy flows help keep the product honest every time it ships.",
    icon: ShieldCheck,
  },
]

const trustStats = [
  { label: "Gateway", value: "Unified API" },
  { label: "Observability", value: "AWS-native" },
  { label: "Risk model", value: "Explainable" },
]

export function TangoComplianceBlock() {
  return (
    <section className="flex flex-col items-center justify-center py-24">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div data-reveal className="flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
                Trust and delivery
              </p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight lg:text-5xl">
                Reliable enough to demo. Structured enough to build on.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">
                TANGO is more than a chart demo. It wraps standardized events,
                secure auth, CI-backed workflows, and AWS delivery into a single
                product surface that teams can actually integrate with.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {trustStats.map((stat) => (
                <div
                  key={stat.label}
                  data-card
                  className="rounded-3xl border bg-background/70 p-4 shadow-sm"
                >
                  <div className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <Card
            data-reveal
            className="relative overflow-hidden rounded-[2rem] border-white/20 bg-[linear-gradient(145deg,rgba(240,249,255,0.88),rgba(255,255,255,0.74))] p-6 shadow-xl shadow-sky-100/40 dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(24,24,27,0.96),rgba(34,34,42,0.84))] dark:shadow-black/30"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(125,211,252,0.35),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(250,204,21,0.18),transparent_22%),radial-gradient(circle_at_74%_78%,rgba(74,222,128,0.18),transparent_24%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="flex items-center justify-center">
                <div
                  data-trust-visual
                  className="relative grid aspect-square w-full max-w-[280px] place-items-center rounded-full border border-white/25 bg-background/70 dark:bg-white/5"
                >
                  <div className="absolute inset-6 rounded-full border border-dashed border-sky-300/50 dark:border-sky-400/20" />
                  <div className="absolute inset-14 rounded-full border border-dashed border-emerald-300/60 dark:border-emerald-400/20" />
                  <div className="absolute inset-0">
                    <div
                      data-trust-node="api"
                      className="absolute grid size-11 place-items-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm dark:bg-sky-500/15 dark:text-sky-200"
                    >
                      <span className="text-[11px] font-semibold tracking-[0.14em]">
                        API
                      </span>
                    </div>
                    <div
                      data-trust-node="idp"
                      className="absolute grid size-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-200"
                    >
                      <span className="text-[10px] font-semibold tracking-[0.12em]">
                        IDP
                      </span>
                    </div>
                    <div
                      data-trust-node="obs"
                      className="absolute grid size-11 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm dark:bg-amber-500/15 dark:text-amber-100"
                    >
                      <span className="text-[10px] font-semibold tracking-[0.12em]">
                        OBS
                      </span>
                    </div>
                  </div>
                  <div className="grid size-28 place-items-center rounded-full bg-foreground text-background shadow-lg">
                    <ShieldCheck className="size-10" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                {trustPillars.map((pillar) => {
                  const Icon = pillar.icon
                  return (
                    <div
                      key={pillar.title}
                      data-card
                      className="rounded-3xl border border-white/20 bg-background/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-foreground text-background dark:bg-white dark:text-black">
                          <Icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {pillar.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
