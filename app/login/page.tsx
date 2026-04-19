import * as React from "react"

import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-svh bg-background px-6 py-10 text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  )
}
