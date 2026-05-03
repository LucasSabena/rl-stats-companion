import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-bg-tertiary p-4 shadow-level-1 transition-all duration-150 ease-out hover:shadow-level-2",
        className
      )}
    >
      {children}
    </div>
  );
}
