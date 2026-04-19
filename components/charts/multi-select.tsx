"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

export function MultiSelect(props: {
  value: string[]
  onValueChange: (next: string[]) => void
  options: string[]
  placeholder?: string
  allowCustom?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [custom, setCustom] = React.useState("")

  const selected = new Set(props.value)
  const opts = props.options ?? []

  function toggle(v: string) {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    props.onValueChange([...next])
  }

  function addCustom() {
    const v = custom.trim()
    if (!v) return
    props.onValueChange([...new Set([...props.value, v])])
    setCustom("")
  }

  return (
    <div className={cn("space-y-2", props.className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button variant="outline" className="w-full justify-between" />
          }
        >
          <span className="truncate text-left text-sm">
            {props.value.length
              ? props.value.join(", ")
              : (props.placeholder ?? "Select...")}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {props.value.length || ""}
          </span>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(22rem,calc(100vw-2rem))] p-0"
        >
          <Command>
            <CommandInput placeholder="Search symbols..." />
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {opts.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => toggle(opt)}
                  className="flex items-center justify-between"
                >
                  <span className="font-mono text-xs">{opt}</span>
                  {selected.has(opt) ? (
                    <Badge variant="secondary">Selected</Badge>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>

          {props.allowCustom ? (
            <div className="border-t p-2">
              <div className="flex gap-2">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  placeholder="Add custom symbol..."
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none"
                />
                <Button
                  type="button"
                  onClick={addCustom}
                  disabled={!custom.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
    </div>
  )
}
