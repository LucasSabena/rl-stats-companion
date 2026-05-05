import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/* ------------------------------------------------------------------ */
/* Create Profile Modal                                                */
/* ------------------------------------------------------------------ */

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, playerName: string) => void;
  isLoading?: boolean;
  error?: string;
}

export function CreateProfileModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  error,
}: CreateProfileModalProps) {
  const [name, setName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [errors, setErrors] = useState<{ name?: string; playerName?: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPlayerName("");
      setErrors({});
      setTimeout(() => nameInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const nextErrors: { name?: string; playerName?: string } = {};
    if (!name.trim()) nextErrors.name = "El nombre del perfil es obligatorio.";
    if (!playerName.trim()) nextErrors.playerName = "El nickname es obligatorio.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onConfirm(name.trim(), playerName.trim());
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear nuevo perfil"
      description="Cada perfil tiene su propio historial de partidas y configuración."
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading}>
            Crear perfil
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-text-primary">
            Nombre del perfil
          </label>
          <input
            ref={nameInputRef}
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            placeholder="Ej. Amigos, Novia..."
            className="w-full border bg-bg-panel border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-colors"
          />
          {errors.name && <p className="text-accent-danger text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="player-name" className="mb-1 block text-sm font-medium text-text-primary">
            Tu nickname en Rocket League
          </label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
            placeholder="Tu nombre en el juego"
            className="w-full border bg-bg-panel border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-colors"
          />
          {errors.playerName && <p className="text-accent-danger text-xs mt-1">{errors.playerName}</p>}
        </div>

        {error && <p className="text-accent-danger text-xs">{error}</p>}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Delete Profile Modal                                                */
/* ------------------------------------------------------------------ */

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
  isLoading?: boolean;
}

export function DeleteProfileModal({
  isOpen,
  onClose,
  onConfirm,
  profileName,
  isLoading,
}: DeleteProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar perfil"
      description={`¿Estás seguro de que quieres eliminar el perfil "${profileName}"? Esta acción no se puede deshacer.`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Eliminar
          </Button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">
        Se perderán todas las partidas y estadísticas asociadas a este perfil.
      </p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Switch Profile Modal                                                */
/* ------------------------------------------------------------------ */

interface SwitchProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  profileName: string;
  isLoading?: boolean;
}

export function SwitchProfileModal({
  isOpen,
  onClose,
  onConfirm,
  profileName,
  isLoading,
}: SwitchProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar de perfil"
      description={`Vas a cambiar al perfil "${profileName}". La aplicación se reiniciará para cargar los datos del nuevo perfil.`}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={onConfirm} isLoading={isLoading}>
            Reiniciar ahora
          </Button>
        </div>
      }
    >
      {null}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Rename Profile Modal                                                */
/* ------------------------------------------------------------------ */

interface RenameProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  currentName: string;
  isLoading?: boolean;
  error?: string;
}

export function RenameProfileModal({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  isLoading,
  error,
}: RenameProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [localError, setLocalError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setLocalError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, currentName]);

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setLocalError("El nombre no puede estar vacío.");
      return;
    }
    if (trimmed === currentName) {
      onClose();
      return;
    }
    setLocalError("");
    onConfirm(trimmed);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Renombrar perfil"
      description="Introduce un nuevo nombre para este perfil."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} isLoading={isLoading}>
            Guardar
          </Button>
        </div>
      }
    >
      <div>
        <label htmlFor="rename-profile" className="mb-1 block text-sm font-medium text-text-primary">
          Nuevo nombre
        </label>
        <input
          ref={inputRef}
          id="rename-profile"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
          }}
          className="w-full border bg-bg-panel border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/50 outline-none transition-colors"
        />
        {(localError || error) && (
          <p className="text-accent-danger text-xs mt-1">{localError || error}</p>
        )}
      </div>
    </Modal>
  );
}
