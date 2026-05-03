import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200", className)}>
      {children}
    </div>
  );
}
