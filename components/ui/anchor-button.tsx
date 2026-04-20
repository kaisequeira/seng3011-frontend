import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants, type ButtonProps } from "@/components/ui/button"

type AnchorButtonProps = Omit<ComponentProps<"a">, "className"> &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string
  }

export function AnchorButton({
  className,
  variant,
  size,
  children,
  ...props
}: AnchorButtonProps) {
  return (
    <a className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </a>
  )
}
