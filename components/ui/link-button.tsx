import Link from "next/link"
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonProps } from "@/components/ui/button"

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> &
  Partial<Pick<ButtonProps, "variant" | "size">> & {
    className?: string
  }

export function LinkButton({
  className,
  variant,
  size,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Link>
  )
}
