import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "outlined" | "outlined-strong" | "glass" | "interactive" | "flat"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-card text-card-foreground border-2 border-border shadow-sm",
    elevated: "bg-card text-card-foreground border-0 shadow-xl",
    outlined: "bg-transparent text-card-foreground border-2 border-border",
    "outlined-strong": "bg-transparent text-card-foreground border-3 border-border-strong",
    glass: "bg-card/70 text-card-foreground backdrop-blur-lg border-2 border-border/40 shadow-lg",
    interactive: "bg-card text-card-foreground border-2 border-border shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-border-strong cursor-pointer",
    flat: "bg-secondary/50 text-card-foreground border-0",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }