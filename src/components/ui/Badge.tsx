import { cn } from "@/lib/utils";

export type BadgeVariant = "live" | "win" | "loss" | "overtime" | "ranked" | "default" | "info" | "accent";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Badge({ variant = "default", children, className, glow = false }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    live: "bg-accent-success-subtle text-accent-success border border-accent-success/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
    win: "bg-accent-success-subtle text-accent-success border border-accent-success/20",
    loss: "bg-accent-danger-subtle text-accent-danger border border-accent-danger/20",
    overtime: "bg-accent-warning-subtle text-accent-warning border border-accent-warning/20",
    ranked: "bg-accent-purple-subtle text-accent-purple border border-accent-purple/20",
    default: "bg-bg-elevated text-text-secondary border border-border-default shadow-[var(--shadow-card-inner)]",
    info: "bg-accent-info-subtle text-accent-info border border-accent-info/20",
    accent: "bg-accent-primary-subtle text-accent-primary border border-accent-primary/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm",
        variants[variant],
        glow && "animate-pulse-subtle",
        className
      )}
    >
      {variant === 'live' && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-accent-success animate-pulse" />
      )}
      {children}
    </span>
  );
}
