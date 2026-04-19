"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type NavItem = { href: string; label: string }

const nav: NavItem[] = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/datasets", label: "Datasets" },
  { href: "/app/charts", label: "Charts" },
  { href: "/app/predict", label: "Predict" },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" })
      if (!res.ok) throw new Error("logout failed")
      toast.success("Signed out.")
    } catch {
      toast.error("Couldn't sign you out. Try again.")
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="px-2 py-3">
          <Link href="/" className="flex items-center gap-2 px-2">
            <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="font-mono text-xs">TG</span>
            </div>
            <div className="leading-tight group-data-[collapsible=icon]:hidden">
              <div className="text-sm font-semibold">TANGO</div>
              <div className="text-xs text-sidebar-foreground/70">
                Event Intelligence
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarMenu className="px-2 py-2">
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href))
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.label}
                    onClick={() => {
                      router.push(item.href)
                      router.refresh()
                    }}
                  >
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Sign out" onClick={logout}>
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {nav.find(
                (x) => pathname === x.href || pathname.startsWith(`${x.href}/`)
              )?.label ?? "App"}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {pathname}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push("/app/charts")}
            >
              Open charts
            </Button>
          </div>
        </header>

        <main className="min-h-[calc(100svh-3.5rem)] bg-background px-4 py-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
