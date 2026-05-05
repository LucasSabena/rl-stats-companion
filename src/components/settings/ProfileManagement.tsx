import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useProfileStore } from "@/stores/profileStore";
import { User, Trash2, Edit3, Plus, AlertCircle } from "lucide-react";

export function ProfileManagement() {
  const {
    profiles,
    activeProfile,
    isLoading,
    fetchProfiles,
    createProfile,
    switchProfile,
    deleteProfile,
    renameProfile,
  } = useProfileStore();

  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  function handleCreate() {
    const name = window.prompt("Nombre del nuevo perfil:");
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed) return;
    if (profiles.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      window.alert("Ya existe un perfil con ese nombre.");
      return;
    }
    void createProfile(trimmed);
  }

  function handleSwitch(profileId: string) {
    void switchProfile(profileId).then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }

  function handleRename(profileId: string, currentName: string) {
    const name = window.prompt("Nuevo nombre:", currentName);
    if (!name) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    if (profiles.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      window.alert("Ya existe un perfil con ese nombre.");
      return;
    }
    void renameProfile(profileId, trimmed);
  }

  function handleDelete(profileId: string, profileName: string) {
    if (profiles.length <= 1) {
      window.alert("No puedes eliminar el último perfil.");
      return;
    }
    if (activeProfile?.id === profileId) {
      window.alert("No puedes eliminar el perfil activo. Cambia de perfil primero.");
      return;
    }
    const confirmed = window.confirm(`¿Eliminar el perfil "${profileName}"? Esta acción no se puede deshacer.`);
    if (confirmed) {
      void deleteProfile(profileId);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-text-primary">Perfiles de jugador</h4>
          <p className="text-sm text-text-secondary">Cada perfil tiene su propio historial y configuración.</p>
        </div>
        <Button variant="secondary" leftIcon={Plus} onClick={handleCreate} isLoading={isLoading}>
          Crear nuevo perfil
        </Button>
      </div>

      {activeProfile && (
        <Card variant="accent" className="flex items-center gap-3">
          <User size={20} className="shrink-0 text-white" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{activeProfile.name}</p>
            <p className="text-xs text-white/80">Perfil activo</p>
          </div>
          <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white">
            Activo
          </span>
        </Card>
      )}

      {profiles.length === 0 && !isLoading && (
        <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-bg-surface p-4 text-sm text-text-secondary">
          <AlertCircle size={18} className="shrink-0 text-text-tertiary" />
          No hay perfiles. Crea uno para comenzar.
        </div>
      )}

      {profiles.length > 0 && (
        <div className="space-y-2">
          {profiles.map((profile) => {
            const isActive = activeProfile?.id === profile.id;
            return (
              <Card
                key={profile.id}
                variant={isActive ? "accent" : "default"}
                className="flex items-center gap-3"
              >
                <User size={18} className={isActive ? "text-white" : "shrink-0 text-text-tertiary"} />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${isActive ? "text-white" : "text-text-primary"}`}>
                    {profile.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isActive ? (
                    <span className="rounded-full bg-accent-primary/20 px-2.5 py-0.5 text-xs font-semibold text-accent-primary">
                      Activo
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSwitch(profile.id)}
                      isLoading={isLoading}
                    >
                      Activar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Edit3}
                    onClick={() => handleRename(profile.id, profile.name)}
                    isLoading={isLoading}
                  >
                    Renombrar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={Trash2}
                    onClick={() => handleDelete(profile.id, profile.name)}
                    disabled={isActive || profiles.length <= 1}
                    isLoading={isLoading}
                  >
                    Eliminar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
