"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import type {
  DialogContentProps,
  DialogDescriptionProps,
  DialogOverlayProps,
  DialogTitleProps,
} from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { asRadix, radixRoot, radixUiExport } from "@/lib/radix-jsx"

const Dialog = radixRoot(DialogPrimitive.Root)
const DialogTrigger = radixRoot(DialogPrimitive.Trigger)
const DialogPortal = radixRoot(DialogPrimitive.Portal)
const DialogCloseEl = asRadix(DialogPrimitive.Close)

const DialogOverlayEl = asRadix(DialogPrimitive.Overlay)
const DialogContentEl = asRadix(DialogPrimitive.Content)
const DialogTitleEl = asRadix(DialogPrimitive.Title)
const DialogDescriptionEl = asRadix(DialogPrimitive.Description)

const DialogClose = DialogPrimitive.Close

const DialogOverlay = radixUiExport<DialogOverlayProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, DialogOverlayProps>(({ className, ...props }, ref) => (
    <DialogOverlayEl
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )) as React.FC<DialogOverlayProps & React.RefAttributes<HTMLDivElement>>
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = radixUiExport<DialogContentProps, HTMLDivElement>(
  React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => (
      <DialogPortal>
        <DialogOverlay />
        <DialogContentEl
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          {...props}
        >
          {children}
          <DialogCloseEl className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogCloseEl>
        </DialogContentEl>
      </DialogPortal>
    )
  ) as React.FC<DialogContentProps & React.RefAttributes<HTMLDivElement>>
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = radixUiExport<DialogTitleProps, HTMLHeadingElement>(
  React.forwardRef<HTMLHeadingElement, DialogTitleProps>(({ className, ...props }, ref) => (
    <DialogTitleEl
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )) as React.FC<DialogTitleProps & React.RefAttributes<HTMLHeadingElement>>
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = radixUiExport<DialogDescriptionProps, HTMLParagraphElement>(
  React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => (
      <DialogDescriptionEl
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    )
  ) as React.FC<DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>>
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
