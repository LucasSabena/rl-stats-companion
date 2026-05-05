import { memo } from "react";
import { cn } from "@/lib/utils";
import { getArenaDisplayName, getArenaImagePath } from "@/lib/arenaMap";
import { MapPin } from "lucide-react";

interface ArenaDisplayProps {
  arena: string | null | undefined;
  showImage?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ArenaDisplay = memo(function ArenaDisplay({
  arena,
  showImage = true,
  size = "md",
  className,
}: ArenaDisplayProps) {
  if (!arena) return null;

  const displayName = getArenaDisplayName(arena);
  const imagePath = getArenaImagePath(arena);

  const sizeClasses = {
    sm: "h-6 w-6 rounded",
    md: "h-10 w-10 rounded-lg",
    lg: "h-16 w-16 rounded-xl",
  };

  const textSizes = {
    sm: "text-[11px]",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showImage && imagePath && (
        <img
          src={imagePath}
          alt={displayName}
          className={cn(
            sizeClasses[size],
            "object-cover border border-border-subtle bg-bg-panel shrink-0"
          )}
          onError={(e) => {
            // Si la imagen no existe, ocultarla y mostrar solo icono+nombre
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <span
        className={cn(
          "font-medium text-text-secondary truncate",
          textSizes[size]
        )}
        title={displayName}
      >
        {displayName}
      </span>
    </div>
  );
});

/**
 * Compact inline arena badge with icon — for use in cards and lists.
 */
export const ArenaBadge = memo(function ArenaBadge({
  arena,
  className,
}: {
  arena: string | null | undefined;
  className?: string;
}) {
  if (!arena) return null;
  const displayName = getArenaDisplayName(arena);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] text-text-muted truncate",
        className
      )}
      title={displayName}
    >
      <MapPin size={12} className="shrink-0 text-text-muted" />
      {displayName}
    </span>
  );
});
