"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function fromIsoDate(s: string): Date | null {
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const [, y, mo, da] = m
  const dt = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(da), 0, 0, 0))
  return Number.isFinite(dt.getTime()) ? dt : null
}

type DatePickerProps = {
  value: string
  onValueChange: (next: string) => void
  label: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onValueChange,
  label,
  disabled,
  className,
}: DatePickerProps) {
  const selected = React.useMemo(() => fromIsoDate(value), [value])

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start font-mono text-xs",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          />
        }
      >
        {value || label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-2">
          <PopoverHeader>
            <PopoverTitle>{label}</PopoverTitle>
          </PopoverHeader>
        </div>
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={(d) => {
            if (!d) return
            onValueChange(toIsoDate(d))
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
