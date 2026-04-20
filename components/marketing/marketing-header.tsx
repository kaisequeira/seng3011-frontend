import Link from "next/link"

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#api", label: "API" },
  { href: "#features", label: "Features" },
  { href: "#integrations", label: "Integrations" },
  { href: "#trust", label: "Trust" },
]

export function MarketingHeader() {
  return (
    <header
      data-marketing-header
      className="pointer-events-none fixed inset-x-0 top-2 z-50 px-4 py-4"
    >
      <div className="pointer-events-auto flex items-center justify-between rounded-full border border-white/15 bg-background/55 px-4 py-3 shadow-lg shadow-black/5 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.18em]">TANGO</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-scroll-link
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sign in
        </Link>
      </div>
    </header>
  )
}
