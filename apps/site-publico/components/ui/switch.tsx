"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import type { SwitchProps } from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import { asRadix, radixUiExport } from "@/lib/radix-jsx"

const SwitchRootEl = asRadix(SwitchPrimitives.Root)
const SwitchThumbEl = asRadix(SwitchPrimitives.Thumb)

const Switch = radixUiExport<SwitchProps, HTMLButtonElement>(
  React.forwardRef<HTMLButtonElement, SwitchProps>(({ className, ...props }, ref) => (
    <SwitchRootEl
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchThumbEl
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchRootEl>
  )) as React.FC<SwitchProps & React.RefAttributes<HTMLButtonElement>>
)
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
