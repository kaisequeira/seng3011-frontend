"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Moon02Icon,
  Sun01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const icon = resolvedTheme === "dark" ? Moon02Icon : Sun01Icon

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger
          render={
            <TooltipTrigger
              render={
                <Button variant="outline" size="icon-sm" aria-label="Theme" />
              }
            />
          }
        >
          <HugeiconsIcon icon={icon} strokeWidth={2} />
        </DropdownMenuTrigger>
        <TooltipContent>Theme</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme ?? "system"}
            onValueChange={setTheme}
          >
            <DropdownMenuRadioItem value="system">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
              System
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="light">
              <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} />
              Dark
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
