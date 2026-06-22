"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import type {
  TabsContentProps,
  TabsListProps,
  TabsTriggerProps,
} from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"
import { radixCreate, radixRoot, radixUiExport } from "@/lib/radix-jsx"

const Tabs = radixRoot(TabsPrimitive.Root)

const TabsList = radixUiExport<TabsListProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList({ className, ...props }, ref) {
    return radixCreate(TabsPrimitive.List, {
      ref,
      className: cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      ),
      ...props,
    })
  }) as React.FC<TabsListProps & React.RefAttributes<HTMLDivElement>>
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = radixUiExport<TabsTriggerProps, HTMLButtonElement>(
  React.forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger({ className, ...props }, ref) {
    return radixCreate(TabsPrimitive.Trigger, {
      ref,
      className: cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className
      ),
      ...props,
    })
  }) as React.FC<TabsTriggerProps & React.RefAttributes<HTMLButtonElement>>
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = radixUiExport<TabsContentProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ className, ...props }, ref) {
    return radixCreate(TabsPrimitive.Content, {
      ref,
      className: cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      ),
      ...props,
    })
  }) as React.FC<TabsContentProps & React.RefAttributes<HTMLDivElement>>
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
