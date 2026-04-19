"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get("next") || "/app"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = (await res.json().catch(() => ({}))) as unknown
      if (!res.ok) {
        const rec =
          typeof json === "object" && json !== null
            ? (json as Record<string, unknown>)
            : null
        toast.error(
          rec && typeof rec.message === "string" ? rec.message : "Login failed"
        )
        return
      }
      toast.success("Welcome back.")
      router.push(next)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-6 space-y-2 text-center">
          <div className="text-sm font-semibold">TANGO</div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use your account to access datasets, charts, and predictive tools.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/signup"
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
