"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import type {
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarProps,
} from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { radixCreate, radixUiExport } from "@/lib/radix-jsx"

const Avatar = radixUiExport<AvatarProps, HTMLSpanElement>(
  React.forwardRef<HTMLSpanElement, AvatarProps>(({ className, ...props }, ref) =>
    radixCreate(AvatarPrimitive.Root, {
      ref,
      className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
      ...props,
    })
  ) as React.FC<AvatarProps & React.RefAttributes<HTMLSpanElement>>
)
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = radixUiExport<AvatarImageProps, HTMLImageElement>(
  React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) =>
    radixCreate(AvatarPrimitive.Image, {
      ref,
      className: cn("aspect-square h-full w-full", className),
      ...props,
    })
  ) as React.FC<AvatarImageProps & React.RefAttributes<HTMLImageElement>>
)
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = radixUiExport<AvatarFallbackProps, HTMLSpanElement>(
  React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(({ className, ...props }, ref) =>
    radixCreate(AvatarPrimitive.Fallback, {
      ref,
      className: cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className),
      ...props,
    })
  ) as React.FC<AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>>
)
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
