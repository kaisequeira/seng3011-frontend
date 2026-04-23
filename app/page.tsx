import { TangoApiShowcaseBlock } from "@/components/marketing/tango-api-showcase-block"
import { TangoComplianceBlock } from "@/components/marketing/tango-compliance-block"
import { TangoFeatureBlock } from "@/components/marketing/tango-feature-block"
import { TangoFooterBlock } from "@/components/marketing/tango-footer-block"
import { TangoHeroBlock } from "@/components/marketing/tango-hero-block"
import { TangoIntegrationsBlock } from "@/components/marketing/tango-integrations-block"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { MarketingMotion } from "@/components/marketing/marketing-motion"
import { Pricing4 } from "@/components/pricing4"
import { buildTangoDocsUrl } from "@/lib/tango/config"

const pricingPlans = [
  {
    name: "TANGO App",
    badge: "Everyone",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    monthlyPriceLabel: "Available to everyone",
    yearlyPriceLabel: "Available to everyone",
    features: [
      "Access to the TANGO web application",
      "Dataset creation and event exploration",
      "Charts, exports, and ADAGE 3.0 views",
      "Predictive spike-risk workflows",
      "Shared learning and demo usage",
    ],
    buttonText: "Available now",
    buttonDisabled: true,
  },
  {
    name: "Pro API",
    badge: "Small business",
    monthlyPrice: "$49",
    yearlyPrice: "$499",
    features: [
      "Everything in TANGO App",
      "API access for small business workflows",
      "50,000 API requests per month",
      "Higher dataset and export limits",
      "Swagger documentation and integration support",
      "Email support for onboarding",
    ],
    buttonText: "Coming soon",
    buttonDisabled: true,
    isPopular: true,
  },
  {
    name: "Enterprise",
    badge: "Large business",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    monthlyPriceLabel: "Tailored agreement",
    yearlyPriceLabel: "Tailored agreement",
    features: [
      "Everything in Pro API",
      "Large-business API and data access",
      "Custom usage limits and deployment guidance",
      "Priority support and implementation reviews",
      "Security, compliance, and procurement assistance",
    ],
    buttonText: "Coming soon",
    buttonDisabled: true,
  },
]

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

      <section id="pricing" className="scroll-mt-28">
        <Pricing4
          title="TANGO Pricing"
          description="The TANGO App is available to everyone. Pro unlocks API access for small businesses, while Enterprise is built for larger teams that need scale, support, and custom integration paths."
          plans={pricingPlans}
        />
      </section>

      <section id="trust" className="scroll-mt-28">
        <TangoComplianceBlock />
      </section>

      <TangoFooterBlock apiBase={apiBase} docsUrl={docsUrl} mailto={mailto} />
    </main>
  )
}
