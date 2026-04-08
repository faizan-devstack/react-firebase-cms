import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-3xl border border-canvas-border bg-canvas-bg px-3 py-1 text-base text-canvas-text-contrast transition-[color,box-shadow,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-canvas-text-contrast placeholder:text-canvas-text focus-visible:border-canvas-border-hover focus-visible:ring-3 focus-visible:ring-canvas-border/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-alert-border aria-invalid:ring-3 aria-invalid:ring-alert-border/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
