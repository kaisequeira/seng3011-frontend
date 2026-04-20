"use client"

import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export function LoadingSpinner({
  className,
  label = "Loading",
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("flex items-center justify-center p-4", className)}
    >
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Loader2 className="size-5 animate-spin" aria-hidden />
      </div>
    </div>
  )
}
