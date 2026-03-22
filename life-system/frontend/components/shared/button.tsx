import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(148,163,184,0.35)]",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-[0_16px_40px_rgba(91,96,255,0.24)] hover:translate-y-[-1px] hover:bg-[color:var(--accent-strong)]",
        secondary:
          "border border-[color:var(--line)] bg-[color:var(--surface-strong)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface)]",
        ghost:
          "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text-primary)]",
        subtle:
          "bg-[color:var(--surface-strong)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface)]",
        danger:
          "bg-[rgba(248,113,113,0.18)] text-[color:var(--danger)] hover:bg-[rgba(248,113,113,0.24)]",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-5",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
