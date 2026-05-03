import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "icon";
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
      "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-accent-primary text-white hover:bg-accent-primary-hover shadow-level-1",
      secondary:
        "border border-border-strong bg-transparent text-text-primary hover:bg-surface-hover",
      danger:
        "border border-accent-danger/30 bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20",
      ghost:
        "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      icon: "h-8 w-8 rounded-md bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary",
    };

    const sizes: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
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
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!isLoading && LeftIcon && <LeftIcon size={16} />}
        {children}
        {!isLoading && RightIcon && <RightIcon size={16} />}
      </button>
    );
  }
);

Button.displayName = "Button";
