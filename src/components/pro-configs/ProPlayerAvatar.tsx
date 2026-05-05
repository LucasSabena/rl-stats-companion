import type { ProPlayer } from "@/lib/proConfigsTypes";

interface Props {
  player: ProPlayer;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
};

export function ProPlayerAvatar({ player, size = "md", className = "" }: Props) {
  return (
    <img
      src={player.imageUrl}
      alt={player.name}
      className={`rounded-full object-cover ring-2 ring-border-subtle ${sizeMap[size]} ${className}`}
      loading="lazy"
      onError={(e) => {
        // Si falla carga, ocultar la imagen para mostrar fallback del padre si existe
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
