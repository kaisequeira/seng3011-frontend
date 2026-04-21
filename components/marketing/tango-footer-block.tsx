import { ArrowUp, BookOpen, LayoutDashboard, Mail } from "lucide-react"

import { Footer7 } from "@/components/footer7"

export function TangoFooterBlock({
  apiBase,
  docsUrl,
  mailto,
}: {
  apiBase: { configured?: string; example: string }
  docsUrl: string
  mailto: string
}) {
  return (
    <Footer7
      logo={{
        url: "/",
        src: "/favicon.ico",
        alt: "TANGO",
        title: "TANGO",
      }}
      description="Dataset-first financial event intelligence for charts, exports, and predictive spike-risk workflows."
      meta={
        <div className="space-y-1">
          <div className="font-mono text-xs break-all">
            API base: {apiBase.configured || apiBase.example}
          </div>
          <div className="font-mono text-xs break-all">Swagger: {docsUrl}</div>
        </div>
      }
      sections={[
        {
          title: "Application",
          links: [
            { name: "Get started", href: "/signup" },
            { name: "Sign in", href: "/login" },
            { name: "Open app", href: "/app" },
          ],
        },
        {
          title: "API",
          links: [{ name: "Swagger docs", href: docsUrl }],
        },
        {
          title: "Contact",
          links: [{ name: "Contact us", href: mailto }],
        },
      ]}
      socialLinks={[
        {
          icon: <LayoutDashboard className="size-5" />,
          href: "/app",
          label: "Open application",
        },
        {
          icon: <BookOpen className="size-5" />,
          href: docsUrl,
          label: "Swagger docs",
        },
        {
          icon: <Mail className="size-5" />,
          href: mailto,
          label: "Contact",
        },
        {
          icon: <ArrowUp className="size-5" />,
          href: "#top",
          label: "Back to top",
        },
      ]}
      copyright={`© ${new Date().getFullYear()} TANGO. Built for SENG3011.`}
      legalLinks={[{ name: "Swagger docs", href: docsUrl }]}
      className="flex flex-col items-center justify-center"
    />
  )
}
