"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import type { SliderProps } from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { radixCreate, radixUiExport } from "@/lib/radix-jsx"

const Slider = radixUiExport<SliderProps, HTMLSpanElement>(
  React.forwardRef<HTMLSpanElement, SliderProps>(({ className, ...props }, ref) =>
    radixCreate(SliderPrimitive.Root, {
      ref,
      className: cn("relative flex w-full touch-none select-none items-center", className),
      ...props,
      children: [
        radixCreate(SliderPrimitive.Track, {
          className: "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
          children: radixCreate(SliderPrimitive.Range, {
            className: "absolute h-full bg-primary",
          }),
        }),
        radixCreate(SliderPrimitive.Thumb, {
          className:
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        }),
      ],
    })
  ) as React.FC<SliderProps & React.RefAttributes<HTMLSpanElement>>
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
