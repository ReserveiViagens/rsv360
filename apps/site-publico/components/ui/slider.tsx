"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"
import { asRadixComponent } from "@/lib/radix-jsx"

const SliderRoot = asRadixComponent(SliderPrimitive.Root)
const SliderTrack = asRadixComponent(SliderPrimitive.Track)
const SliderRange = asRadixComponent(SliderPrimitive.Range)
const SliderThumb = asRadixComponent(SliderPrimitive.Thumb)

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderRoot
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderTrack className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderRange className="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
  </SliderRoot>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
