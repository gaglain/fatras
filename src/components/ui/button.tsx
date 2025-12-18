import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground border-2 border-primary shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "border-2 border-border-strong bg-background text-foreground hover:bg-secondary hover:border-foreground",
        "outline-subtle":
          "border-2 border-border bg-background text-foreground hover:bg-secondary hover:border-border-strong",
        secondary:
          "bg-secondary text-secondary-foreground border-2 border-secondary shadow-sm hover:bg-secondary/80 hover:shadow-md hover:border-border",
        ghost: 
          "hover:bg-secondary hover:text-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline font-medium",
        // Milkjar-inspired variants
        gradient:
          "bg-gradient-primary text-primary-foreground border-2 border-primary/50 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:brightness-110",
        warm:
          "bg-gradient-warm text-primary-foreground border-2 border-accent/50 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        soft:
          "bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/30 hover:border-primary/50",
        glass:
          "bg-background/70 backdrop-blur-sm border-2 border-border hover:bg-background/90 hover:border-border-strong",
        // Bold & prominent
        bold:
          "bg-foreground text-background border-2 border-foreground hover:bg-foreground/90",
        "outline-bold":
          "border-3 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-md",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }