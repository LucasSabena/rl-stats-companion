import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:opacity-50 disabled:pointer-events-none active:scale-95 select-none relative overflow-hidden group";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-accent-primary text-white hover:bg-accent-primary-hover shadow-level-1 hover:shadow-glow-blue border border-accent-primary-hover/50",
      accent:
        "bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-level-1 hover:shadow-level-2 hover:shadow-glow-orange border border-white/10",
      secondary:
        "border border-border-default bg-bg-surface text-text-primary hover:bg-surface-hover hover:border-border-highlight shadow-[var(--shadow-card-inner)] hover:shadow-level-1",
      danger:
        "border border-accent-danger/30 bg-accent-danger-subtle text-accent-danger hover:bg-accent-danger/20 hover:border-accent-danger/50",
      ghost:
        "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      icon: "h-9 w-9 rounded-lg bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variant !== "icon" && sizes[size],
          variants[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Glossy overlay for non-ghost/icon buttons */}
        {(variant === "primary" || variant === "accent") && (
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-lg" />
        )}
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {!isLoading && LeftIcon && <LeftIcon size={16} />}
          {children}
          {!isLoading && RightIcon && <RightIcon size={16} />}
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
