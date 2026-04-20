"use client"

import { SignupForm } from "@/components/signup-form"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, LayoutBottomIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HugeiconsIcon
                icon={LayoutBottomIcon}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            TANGO
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
              Back to home
            </Link>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l bg-muted lg:block">
        <Image
          src="/AuthImage.jpg"
          alt="TANGO authentication"
          fill
          priority
          className="object-cover dark:brightness-[0.7] dark:contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent" />
      </div>
    </div>
  )
}
