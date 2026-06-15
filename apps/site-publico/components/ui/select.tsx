"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import type {
  SelectContentProps,
  SelectItemProps,
  SelectLabelProps,
  SelectScrollDownButtonProps,
  SelectScrollUpButtonProps,
  SelectSeparatorProps,
  SelectTriggerProps,
} from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { radixCreate, radixRoot, radixUiExport } from "@/lib/radix-jsx"

const Select = radixRoot(SelectPrimitive.Root)
const SelectValue = radixRoot(SelectPrimitive.Value)
const SelectGroup = SelectPrimitive.Group

const SelectTrigger = radixUiExport<SelectTriggerProps, HTMLButtonElement>(
  React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) =>
      radixCreate(SelectPrimitive.Trigger, {
        ref,
        className: cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        ),
        ...props,
        children: [
          children,
          radixCreate(SelectPrimitive.Icon, {
            asChild: true,
            children: <ChevronDown className="h-4 w-4 opacity-50" />,
          }),
        ],
      })
  ) as React.FC<SelectTriggerProps & React.RefAttributes<HTMLButtonElement>>
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = radixUiExport<SelectScrollUpButtonProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectScrollUpButtonProps>(({ className, ...props }, ref) =>
    radixCreate(SelectPrimitive.ScrollUpButton, {
      ref,
      className: cn("flex cursor-default items-center justify-center py-1", className),
      ...props,
      children: <ChevronUp className="h-4 w-4" />,
    })
  ) as React.FC<SelectScrollUpButtonProps & React.RefAttributes<HTMLDivElement>>
)
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = radixUiExport<SelectScrollDownButtonProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectScrollDownButtonProps>(({ className, ...props }, ref) =>
    radixCreate(SelectPrimitive.ScrollDownButton, {
      ref,
      className: cn("flex cursor-default items-center justify-center py-1", className),
      ...props,
      children: <ChevronDown className="h-4 w-4" />,
    })
  ) as React.FC<SelectScrollDownButtonProps & React.RefAttributes<HTMLDivElement>>
)
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = radixUiExport<SelectContentProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, position = "popper", ...props }, ref) =>
      radixCreate(SelectPrimitive.Portal, {
        children: radixCreate(SelectPrimitive.Content, {
          ref,
          className: cn(
            "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          ),
          position,
          ...props,
          children: [
            <SelectScrollUpButton key="up" />,
            radixCreate(SelectPrimitive.Viewport, {
              className: cn(
                "p-1",
                position === "popper" &&
                  "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
              ),
              children,
            }),
            <SelectScrollDownButton key="down" />,
          ],
        }),
      })
  ) as React.FC<SelectContentProps & React.RefAttributes<HTMLDivElement>>
)
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = radixUiExport<SelectLabelProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectLabelProps>(({ className, ...props }, ref) =>
    radixCreate(SelectPrimitive.Label, {
      ref,
      className: cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className),
      ...props,
    })
  ) as React.FC<SelectLabelProps & React.RefAttributes<HTMLDivElement>>
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = radixUiExport<SelectItemProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectItemProps>(({ className, children, ...props }, ref) =>
    radixCreate(SelectPrimitive.Item, {
      ref,
      className: cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      ),
      ...props,
      children: [
        <span key="indicator" className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {radixCreate(SelectPrimitive.ItemIndicator, {
            children: <Check className="h-4 w-4" />,
          })}
        </span>,
        radixCreate(SelectPrimitive.ItemText, { children }),
      ],
    })
  ) as React.FC<SelectItemProps & React.RefAttributes<HTMLDivElement>>
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = radixUiExport<SelectSeparatorProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, SelectSeparatorProps>(({ className, ...props }, ref) =>
    radixCreate(SelectPrimitive.Separator, {
      ref,
      className: cn("-mx-1 my-1 h-px bg-muted", className),
      ...props,
    })
  ) as React.FC<SelectSeparatorProps & React.RefAttributes<HTMLDivElement>>
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
