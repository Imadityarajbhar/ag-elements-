import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-1 text-xs font-label-sm uppercase tracking-widest z-10 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-ag-purple text-pearl-white",
        sale: "bg-ag-purple text-pearl-white",
        new: "bg-ag-purple text-pearl-white",
        bestseller: "bg-pearl-white text-charcoal-navy border border-outline-variant/30",
        trending: "bg-pearl-white text-charcoal-navy border border-outline-variant/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
