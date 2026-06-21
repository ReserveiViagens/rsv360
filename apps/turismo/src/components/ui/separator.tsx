"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type { SeparatorProps } from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"
import { radixCreate, radixUiExport } from "@/lib/radix-jsx"

const SeparatorRoot = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) =>
    radixCreate(SeparatorPrimitive.Root, {
      ref,
      decorative,
      orientation,
      className: cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className
      ),
      ...props,
    })
)
SeparatorRoot.displayName = SeparatorPrimitive.Root.displayName

const Separator = radixUiExport<SeparatorProps, HTMLDivElement>(
  SeparatorRoot as React.FC<SeparatorProps & React.RefAttributes<HTMLDivElement>>
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
