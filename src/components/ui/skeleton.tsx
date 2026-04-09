import * as React from "react"

function Skeleton(
  { className, ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={`animate-pulse rounded-md bg-canvas-bg-subtle ${className || ''}`}
      {...props}
    />
  )
}

export { Skeleton }
