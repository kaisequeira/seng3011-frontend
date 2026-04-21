import { AppHomePageClient } from "@/components/app/app-home-page-client"
import {
  buildTangoDocsUrl,
  getTangoBaseUrlOrFallback,
} from "@/lib/tango/config"

export default function AppHomePage() {
  const docsUrl = buildTangoDocsUrl(getTangoBaseUrlOrFallback())
  return <AppHomePageClient docsUrl={docsUrl} />
}
