import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass" | "accent";
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  variant = "default",
  hoverable = false,
  onClick,
}: CardProps) {
  const variants = {
    default: "border-border-subtle bg-bg-secondary",
    elevated: "border-border-default bg-bg-elevated shadow-level-2",
    glass: "surface-glass border-border-subtle",
    accent: "border-border-accent bg-accent-primary-muted",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200 ease-out",
        variants[variant],
        hoverable && "cursor-pointer hover:-translate-y-0.5 hover:border-border-strong hover:shadow-level-3",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
