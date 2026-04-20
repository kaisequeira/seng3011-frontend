"use client"

import { usePathname, useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ChartBarLineIcon,
  Logout01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

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
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TopBar } from "@/components/app/top-bar"
import { readClientCookie } from "@/lib/read-client-cookie"

type DatasetMeta = {
  dataset_id: string
  name?: string
  description?: string
  dataset_type?: string
  data_source?: string
}

function initialsFrom(email: string) {
  const at = email.indexOf("@")
  const base = (at > 0 ? email.slice(0, at) : email).trim()
  if (!base) return "U"
  const parts = base.split(/[._-]+/g).filter(Boolean)
  const a = parts[0]?.[0] ?? base[0]
  const b = parts[1]?.[0] ?? base[1] ?? ""
  return `${String(a).toUpperCase()}${String(b).toUpperCase()}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const [datasets, setDatasets] = React.useState<DatasetMeta[] | null>(null)
  const [loadingDatasets, setLoadingDatasets] = React.useState(false)

  const [createOpen, setCreateOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const [userEmail, setUserEmail] = React.useState<string | null>(null)
  React.useEffect(() => {
    setUserEmail(readClientCookie("tango_user_email"))
  }, [])

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

  async function loadDatasets() {
    setLoadingDatasets(true)
    try {
      const res = await fetch("/api/datasets")
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(json?.message ?? "Failed to load datasets")
        return
      }
      setDatasets(Array.isArray(json) ? (json as DatasetMeta[]) : [])
    } finally {
      setLoadingDatasets(false)
    }
  }

  React.useEffect(() => {
    loadDatasets().catch(() => {})
    const pollId = window.setInterval(() => {
      loadDatasets().catch(() => {})
    }, 30_000)
    return () => window.clearInterval(pollId)
  }, [])

  async function createDataset() {
    if (!name.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/datasets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.message ?? "Failed to create dataset")
        return
      }
      toast.success("Dataset created.")
      setCreateOpen(false)
      setName("")
      setDescription("")
      await loadDatasets()
      const id =
        json && typeof json.dataset_id === "string" ? json.dataset_id : null
      if (id) {
        router.push(`/app/datasets/${encodeURIComponent(id)}`)
        router.refresh()
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader className="px-2 py-3">
          <div className="flex items-center gap-2 px-2">
            <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <span className="font-mono text-xs">
                {userEmail ? initialsFrom(userEmail) : "TG"}
              </span>
            </div>
            <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
              <div className="truncate text-sm font-semibold">
                {userEmail ? "Signed in" : "TANGO"}
              </div>
              <div className="truncate text-xs text-sidebar-foreground/70">
                {userEmail ?? "Event Intelligence"}
              </div>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/app"}
                  tooltip="Dashboard"
                  onClick={() => {
                    router.push("/app")
                    router.refresh()
                  }}
                >
                  <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-3 flex items-center justify-between px-2">
              <div className="text-[0.625rem] font-semibold tracking-wide text-sidebar-foreground/70">
                DATASETS
              </div>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <Tooltip>
                  <DialogTrigger
                    render={
                      <TooltipTrigger
                        render={<Button variant="outline" size="icon-xs" />}
                      />
                    }
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                    <span className="sr-only">Add dataset</span>
                  </DialogTrigger>
                  <TooltipContent>Add dataset</TooltipContent>
                </Tooltip>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create dataset</DialogTitle>
                    <DialogDescription>
                      Create a dataset, then ingest tickers directly into it.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-name">Name</Label>
                      <Input
                        id="create-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Tech Stocks Q1 2026"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-desc">Description</Label>
                      <Input
                        id="create-desc"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={() => createDataset().catch(() => {})}
                      disabled={!name.trim() || creating}
                    >
                      {creating ? "Creating…" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-2">
              {loadingDatasets && !datasets ? (
                <div className="px-2 py-2">
                  <LoadingSpinner
                    className="min-h-24"
                    label="Loading datasets"
                  />
                </div>
              ) : datasets && datasets.length === 0 ? (
                <div className="px-2 py-3 text-xs text-sidebar-foreground/70">
                  No datasets yet. Use the + button to create one.
                </div>
              ) : datasets ? (
                <SidebarMenu>
                  {datasets.map((d) => {
                    const href = `/app/datasets/${encodeURIComponent(d.dataset_id)}`
                    const active =
                      pathname === href || pathname.startsWith(`${href}/`)
                    return (
                      <SidebarMenuItem key={d.dataset_id}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={d.name ?? d.dataset_id}
                          onClick={() => {
                            router.push(href)
                            router.refresh()
                          }}
                        >
                          <HugeiconsIcon
                            icon={ChartBarLineIcon}
                            strokeWidth={2}
                          />
                          <span className="truncate">
                            {d.name ?? d.dataset_id}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              ) : null}
            </div>
          </div>
        </SidebarContent>

        <SidebarFooter className="px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Sign out" onClick={logout}>
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <TopBar />
        <main className="min-h-0 bg-background">
          <div className="p-4">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
