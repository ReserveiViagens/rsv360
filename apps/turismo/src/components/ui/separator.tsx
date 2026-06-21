"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import type { SeparatorProps } from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"
import { radixCreate, radixUiExport } from "@/lib/radix-jsx"

const Separator = radixUiExport<SeparatorProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) {
    return radixCreate(SeparatorPrimitive.Root, {
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
  }) as React.FC<SeparatorProps & React.RefAttributes<HTMLDivElement>>
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
