"use client"

import { Grid3x3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ViewType = "grid" | "list"

export interface ViewToggleProps {
  value: ViewType
  onValueChange: (value: ViewType) => void
  className?: string
}

export function ViewToggle({ value, onValueChange, className }: ViewToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 bg-gray-100 rounded-lg p-1 min-h-[44px]", className)}>
      <button
        type="button"
        onClick={() => onValueChange("grid")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px]",
          value === "grid"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
        aria-pressed={value === "grid"}
        aria-label="Visualização em grade"
      >
        <Grid3x3 className="w-4 h-4" />
        <span className="hidden sm:inline">Grade</span>
      </button>
      <button
        type="button"
        onClick={() => onValueChange("list")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors min-h-[36px]",
          value === "list"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        )}
        aria-pressed={value === "list"}
        aria-label="Visualização em lista"
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Lista</span>
      </button>
    </div>
  )
}
