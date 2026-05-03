import { cn } from "@/lib/utils";

export type BadgeVariant = "live" | "win" | "loss" | "overtime" | "ranked" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    live: "bg-accent-secondary/20 text-accent-secondary",
    win: "bg-accent-secondary/20 text-accent-secondary",
    loss: "bg-accent-danger/20 text-accent-danger",
    overtime: "bg-accent-warning/20 text-accent-warning",
    ranked: "bg-accent-purple/20 text-accent-purple",
    default: "bg-bg-tertiary text-text-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
