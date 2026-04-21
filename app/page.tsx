import { TangoApiShowcaseBlock } from "@/components/marketing/tango-api-showcase-block"
import { TangoComplianceBlock } from "@/components/marketing/tango-compliance-block"
import { TangoFeatureBlock } from "@/components/marketing/tango-feature-block"
import { TangoFooterBlock } from "@/components/marketing/tango-footer-block"
import { TangoHeroBlock } from "@/components/marketing/tango-hero-block"
import { TangoIntegrationsBlock } from "@/components/marketing/tango-integrations-block"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingMotion } from "@/components/marketing/marketing-motion"
import { buildTangoDocsUrl } from "@/lib/tango/config"

export default function Page() {
  const mailto = `mailto:z5591304@ad.unsw.edu.au?subject=${encodeURIComponent(
    "TANGO API collaboration"
  )}&body=${encodeURIComponent(
    "Hi Alex,\n\nWe are using the TANGO Financial Events APIs and would like to collaborate. Could you share usage notes, integration details, and any recommended workflows?\n\nThanks,\n"
  )}`

  const apiBase = {
    configured: process.env.TANGO_API_BASE_URL || undefined,
    example: "https://<api-id>.execute-api.<region>.amazonaws.com/prod",
  }

  const codePreviewBaseUrl = apiBase.configured || apiBase.example
  const docsUrl = buildTangoDocsUrl(codePreviewBaseUrl)

  return (
    <main id="top" className="min-h-svh bg-background text-foreground">
      <MarketingMotion />
      <MarketingHeader />

      <section id="product" className="scroll-mt-28 pt-20">
        <TangoHeroBlock />
      </section>

      <section id="api" className="scroll-mt-28">
        <TangoApiShowcaseBlock
          apiBaseUrl={codePreviewBaseUrl}
          docsUrl={docsUrl}
        />
      </section>

      <section id="features" className="scroll-mt-28">
        <TangoFeatureBlock docsUrl={docsUrl} />
      </section>

      <section id="integrations" className="scroll-mt-28">
        <TangoIntegrationsBlock />
      </section>

      <section id="trust" className="scroll-mt-28">
        <TangoComplianceBlock />
      </section>

      <TangoFooterBlock apiBase={apiBase} docsUrl={docsUrl} mailto={mailto} />
    </main>
  )
}
