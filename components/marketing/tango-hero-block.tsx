import { Hero206 } from "@/components/hero206"
import { LinkButton } from "@/components/ui/link-button"

export function TangoHeroBlock() {
  return (
    <Hero206
      heading={
        <>
          Dataset-first market
          <br />
          intelligence for real teams
        </>
      }
      description={
        <>
          Build structured financial event datasets, explore charts and
          extractions, export clean ADAGE 3.0 data, and run volatility spike
          forecasts with macro and electricity overlays.
        </>
      }
      trustItems={[]}
      actions={
        <>
          <LinkButton href="/signup">Get started</LinkButton>
          <LinkButton href="/login?next=/app" variant="outline">
            Open dashboard
          </LinkButton>
        </>
      }
      browserUrl="https://seng3011-frontend.vercel.app/"
      dashboardUrlDesktop="/Application.png"
      dashboardUrlMobile="/Application.png"
      className="flex flex-col items-center justify-center"
    />
  )
}
