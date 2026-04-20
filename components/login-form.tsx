"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function LoginForm({
  className,
  nextUrl,
  ...props
}: React.ComponentProps<"form"> & { nextUrl?: string }) {
  const router = useRouter()
  const next = nextUrl || "/app"

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={async (e) => {
        e.preventDefault()
        if (submitting) return
        setError(null)
        setSubmitting(true)
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as {
              message?: string
            } | null
            setError(data?.message || "Login failed. Please try again.")
            return
          }

          // Non-HttpOnly mirror so client components can greet the user; matches
          // `setSessionCookies` in `/api/auth/login` when the response applies.
          const maxAge = 60 * 60 * 24 * 7
          document.cookie = `tango_user_email=${encodeURIComponent(email)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`

          router.push(next)
        } catch {
          setError(
            "Could not reach the auth service. Check your TANGO base URL and try again."
          )
        } finally {
          setSubmitting(false)
        }
      }}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Use your Cognito-backed TANGO account to open the workspace.
          </p>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Sign-in failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
