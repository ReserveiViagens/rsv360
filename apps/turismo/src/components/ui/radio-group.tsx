"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import type { RadioGroupItemProps, RadioGroupProps } from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { radixCreate, radixUiExport } from "@/lib/radix-jsx"

const RadioGroup = radixUiExport<RadioGroupProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup({ className, ...props }, ref) {
    return radixCreate(RadioGroupPrimitive.Root, {
      className: cn("grid gap-2", className),
      ...props,
      ref,
    })
  }) as React.FC<RadioGroupProps & React.RefAttributes<HTMLDivElement>>
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = radixUiExport<RadioGroupItemProps, HTMLButtonElement>(
  React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem({ className, ...props }, ref) {
    return radixCreate(RadioGroupPrimitive.Item, {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: radixCreate(RadioGroupPrimitive.Indicator, {
        className: "flex items-center justify-center",
        children: <Circle className="h-2.5 w-2.5 fill-current text-current" />,
      }),
    })
  }) as React.FC<RadioGroupItemProps & React.RefAttributes<HTMLButtonElement>>
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
