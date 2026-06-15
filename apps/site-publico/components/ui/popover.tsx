"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import type { PopoverContentProps } from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"
import { radixCreate, radixRoot, radixUiExport } from "@/lib/radix-jsx"

const Popover = radixRoot(PopoverPrimitive.Root)
const PopoverTrigger = radixRoot(PopoverPrimitive.Trigger)

const PopoverContent = radixUiExport<PopoverContentProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, PopoverContentProps>(
    ({ className, align = "center", sideOffset = 4, ...props }, ref) =>
      radixCreate(PopoverPrimitive.Portal, {
        children: radixCreate(PopoverPrimitive.Content, {
          ref,
          align,
          sideOffset,
          className: cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          ),
          ...props,
        }),
      })
  ) as React.FC<PopoverContentProps & React.RefAttributes<HTMLDivElement>>
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
