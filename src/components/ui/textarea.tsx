import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-canvas-border bg-canvas-bg px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-canvas-text focus-visible:border-canvas-border-hover disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-alert-border md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
