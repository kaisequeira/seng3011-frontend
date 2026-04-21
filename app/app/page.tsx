import { AppHomePageClient } from "@/components/app/app-home-page-client"
import { requireTangoDocsUrl } from "@/lib/tango/config"

export default function AppHomePage() {
  const docsUrl = requireTangoDocsUrl()
  return <AppHomePageClient docsUrl={docsUrl} />
}
