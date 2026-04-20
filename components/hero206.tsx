"use client"

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Plus,
  RotateCw,
  Share,
} from "lucide-react"
import React from "react"

import { useGoogleFont } from "@/hooks/use-google-font"
import { cn } from "@/lib/utils"

interface Hero206Props {
  className?: string
  heading?: React.ReactNode
  description?: React.ReactNode
  trustItems?: string[]
  actions?: React.ReactNode
  browserUrl?: string
  dashboardUrlDesktop?: string
  dashboardUrlMobile?: string
}

const Hero206 = ({
  className,
  heading = (
    <>
      Shadcn Blocks <br /> Just Copy/Paste.
    </>
  ),
  description = (
    <>
      Build beautiful, accessible components with shadcn/ui. Simply run the CLI
      to add components directly to your project—no package dependencies
      required.
    </>
  ),
  trustItems = ["Trusted by 10k+ users"],
  actions,
  browserUrl = "https://shadcnblocks.com/block/hero206",
  dashboardUrlDesktop = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/dashboard-1.png",
  dashboardUrlMobile = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/dashboard-mobile-1.png",
}: Hero206Props) => {
  useGoogleFont("Antonio")
  return (
    <section
      className={cn("bg-background", className)}
      style={{ "--font-antonio": "Antonio, sans-serif" } as React.CSSProperties}
    >
      <div className="relative container py-32">
        <header data-hero-copy className="mx-auto max-w-3xl text-center">
          <h1 className="font-antonio text-5xl font-semibold text-foreground uppercase md:text-7xl">
            {heading}
          </h1>
          <p className="my-7 max-w-3xl font-sans tracking-tight text-muted-foreground md:text-xl">
            {description}
          </p>
          {actions ? (
            <div
              data-hero-actions
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              {actions}
            </div>
          ) : null}
        </header>

        {trustItems.length > 0 ? (
          <div className="mx-auto mt-10 flex h-auto max-w-full flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-sm font-normal md:text-base">
            {trustItems.map((item) => (
              <span
                key={item}
                className="rounded-full border bg-background px-3 py-1 tracking-tight"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}

        <div
          data-hero-browser
          className="relative mt-12 flex h-full w-full flex-col items-center justify-center"
        >
          <BrowserMockup
            className="w-full"
            url={browserUrl}
            DahboardUrlDesktop={dashboardUrlDesktop}
            DahboardUrlMobile={dashboardUrlMobile}
          />
          <div className="absolute bottom-0 h-2/3 w-full bg-linear-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  )
}

export { Hero206 }

const BrowserMockup = ({
  className = "",
  url = "https://shadcnblocks.com/block/hero206",
  DahboardUrlDesktop = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/dashboard-1.png",
  DahboardUrlMobile = "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard/dashboard-mobile-1.png",
}) => (
  <div
    className={cn(
      "relative w-full overflow-hidden rounded-4xl border",
      className
    )}
  >
    <div className="flex items-center justify-between gap-10 bg-muted px-8 py-4 lg:gap-25">
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full bg-red-500" />
        <div className="size-3 rounded-full bg-yellow-500" />
        <div className="size-3 rounded-full bg-green-500" />
        <div className="ml-6 hidden items-center gap-2 opacity-40 lg:flex">
          <ChevronLeft className="size-5" />
          <ChevronRight className="size-5" />
        </div>
      </div>
      <div className="flex w-full items-center justify-center">
        <p className="relative hidden w-full rounded-full bg-background px-4 py-1 text-center text-sm tracking-tight md:block">
          {url}
          <RotateCw className="absolute top-2 right-3 size-3.5" />
        </p>
      </div>

      <div className="flex items-center gap-4 opacity-40">
        <Share className="size-4" />
        <Plus className="size-4" />
        <Copy className="size-4" />
      </div>
    </div>

    <div className="relative w-full">
      <img
        src={DahboardUrlDesktop}
        alt=""
        className="object-cove hidden aspect-video h-full w-full object-top md:block"
      />
      <img
        src={DahboardUrlMobile}
        alt=""
        className="block h-full w-full object-cover md:hidden"
      />
    </div>
    <div className="absolute bottom-0 z-10 flex w-full items-center justify-center bg-muted py-3 md:hidden">
      <p className="relative flex items-center gap-2 rounded-full px-8 py-1 text-center text-sm tracking-tight">
        {url}
      </p>
    </div>
  </div>
)
