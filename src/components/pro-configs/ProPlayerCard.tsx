import type { ProPlayer } from "@/lib/proConfigsTypes";
import { ExternalLink, Monitor, Gamepad2, Headphones, Crosshair } from "lucide-react";

interface Props {
  player: ProPlayer;
}

export function ProPlayerCard({ player }: Props) {
  const hasSettings = player.camera || player.controls || player.deadzone || player.hardware;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">{player.name}</h2>
          {player.fullName && (
            <p className="text-sm text-text-tertiary">{player.fullName}</p>
          )}
          <div className="mt-2 flex items-center gap-3 text-sm text-text-secondary">
            <span>{player.nationality}</span>
            <span className="text-text-tertiary">·</span>
            <span className="font-medium text-accent-primary">{player.team}</span>
            <span className="text-text-tertiary">·</span>
            <span>{player.continent}</span>
          </div>
        </div>
        <a
          href={player.liquipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
        >
          <ExternalLink size={14} />
          Liquipedia
        </a>
      </div>

      {!hasSettings && (
        <div className="rounded-lg border border-border-subtle bg-surface-elevated p-6 text-center">
          <p className="text-text-tertiary">
            No hay configuraciones disponibles para este jugador en Liquipedia.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {player.camera && <CameraPanel camera={player.camera} />}
        {player.controls && <ControlsPanel controls={player.controls} />}
        {player.deadzone && <DeadzonePanel deadzone={player.deadzone} />}
        {player.hardware && <HardwarePanel hardware={player.hardware} />}
      </div>
    </div>
  );
}

/* ─── Camera Settings Panel ───────────────────────────────────────────────── */

function CameraPanel({ camera }: { camera: NonNullable<ProPlayer["camera"]> }) {
  return (
    <PanelBox icon={<Crosshair size={18} />} title="Camara" lastUpdated={camera.lastUpdated}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label="Camera Shake" value={camera.cameraShake} />
        <Row label="Ball Camera" value={camera.ballCamera} />
        <Row label="FOV" value={camera.fov.toString()} />
        <Row label="Height" value={camera.height.toString()} />
        <Row label="Angle" value={camera.angle.toFixed(1)} />
        <Row label="Distance" value={camera.distance.toString()} />
        <Row label="Stiffness" value={camera.stiffness.toFixed(2)} />
        <Row label="Swivel Speed" value={camera.swivelSpeed.toFixed(2)} />
        <Row label="Transition Speed" value={camera.transitionSpeed.toFixed(2)} />
      </div>
    </PanelBox>
  );
}

/* ─── Controls Panel ──────────────────────────────────────────────────────── */

function ControlsPanel({ controls }: { controls: NonNullable<ProPlayer["controls"]> }) {
  return (
    <PanelBox icon={<Gamepad2 size={18} />} title="Controles">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label="Powerslide" value={controls.powerslide || "-"} />
        <Row label="Air Roll Left" value={controls.airRollLeft || "-"} />
        <Row label="Air Roll Right" value={controls.airRollRight || "-"} />
        <Row label="Boost" value={controls.boost || "-"} />
        <Row label="Jump" value={controls.jump || "-"} />
        <Row label="Ball Cam" value={controls.ballCam || "-"} />
        <Row label="Brake" value={controls.brake || "-"} />
        <Row label="Throttle" value={controls.throttle || "-"} />
      </div>
    </PanelBox>
  );
}

/* ─── Deadzone Panel ──────────────────────────────────────────────────────── */

function DeadzonePanel({ deadzone }: { deadzone: NonNullable<ProPlayer["deadzone"]> }) {
  return (
    <PanelBox icon={<Crosshair size={18} />} title="Deadzone" lastUpdated={deadzone.lastUpdated}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label="Deadzone Shape" value={deadzone.deadzoneShape} />
        <Row label="Deadzone" value={deadzone.deadzone.toFixed(2)} />
        <Row label="Dodge Deadzone" value={deadzone.dodgeDeadzone.toFixed(2)} />
        <Row label="Aerial Sensitivity" value={deadzone.aerialSensitivity.toFixed(2)} />
        <Row label="Steering Sensitivity" value={deadzone.steeringSensitivity.toFixed(2)} />
      </div>
    </PanelBox>
  );
}

/* ─── Hardware Panel ──────────────────────────────────────────────────────── */

function HardwarePanel({ hardware }: { hardware: NonNullable<ProPlayer["hardware"]> }) {
  return (
    <PanelBox icon={<Monitor size={18} />} title="Hardware">
      <div className="space-y-2 text-sm">
        <HardwareRow icon={<Gamepad2 size={14} />} label="Controller" value={hardware.controller} />
        <HardwareRow icon={<Monitor size={14} />} label="Monitor" value={hardware.monitor} />
        <HardwareRow icon={<Headphones size={14} />} label="Headset" value={hardware.headset} />
      </div>
    </PanelBox>
  );
}

/* ─── Shared components ───────────────────────────────────────────────────── */

function PanelBox({
  icon,
  title,
  lastUpdated,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-accent-primary">{icon}</span>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {lastUpdated && (
          <span className="ml-auto text-xs text-text-tertiary">
            Actualizado: {lastUpdated}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-text-tertiary">{label}</span>
      <span className="text-right font-mono font-medium text-text-primary">{value}</span>
    </>
  );
}

function HardwareRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-text-tertiary">{icon}</span>
      <span className="min-w-[80px] text-text-tertiary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
