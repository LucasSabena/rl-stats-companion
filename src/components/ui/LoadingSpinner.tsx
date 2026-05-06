import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 24, className }: LoadingSpinnerProps) {
  const { t } = useTranslation("common");
  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label={t("accessibility.loading")}
    />
  );
}
