import type { ProPlayer } from "@/lib/proConfigsTypes";
import { useTranslation } from "react-i18next";
import { ProPlayerAvatar } from "./ProPlayerAvatar";
import { ExternalLink, Monitor, Gamepad2, Headphones, Crosshair } from "lucide-react";

interface Props {
  player: ProPlayer;
}

export function ProPlayerCard({ player }: Props) {
  const { t } = useTranslation(["proConfigs", "common"]);
  const hasSettings = player.camera || player.controls || player.deadzone || player.hardware;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {player.imageUrl && (
            <ProPlayerAvatar player={player} size="lg" />
          )}
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
            {t("proConfigs:noSettings")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {player.camera && <CameraPanel camera={player.camera} t={t} />}
        {player.controls && <ControlsPanel controls={player.controls} t={t} />}
        {player.deadzone && <DeadzonePanel deadzone={player.deadzone} t={t} />}
        {player.hardware && <HardwarePanel hardware={player.hardware} t={t} />}
      </div>
    </div>
  );
}

/* ─── Camera Settings Panel ───────────────────────────────────────────────── */

function CameraPanel({ camera, t }: { camera: NonNullable<ProPlayer["camera"]>; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <PanelBox icon={<Crosshair size={18} />} title={t("proConfigs:panels.camera.title")} lastUpdated={camera.lastUpdated} t={t}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label={t("proConfigs:panels.camera.cameraShake")} value={camera.cameraShake} />
        <Row label={t("proConfigs:panels.camera.ballCamera")} value={camera.ballCamera} />
        <Row label={t("proConfigs:panels.camera.fov")} value={camera.fov.toString()} />
        <Row label={t("proConfigs:panels.camera.height")} value={camera.height.toString()} />
        <Row label={t("proConfigs:panels.camera.angle")} value={camera.angle.toFixed(1)} />
        <Row label={t("proConfigs:panels.camera.distance")} value={camera.distance.toString()} />
        <Row label={t("proConfigs:panels.camera.stiffness")} value={camera.stiffness.toFixed(2)} />
        <Row label={t("proConfigs:panels.camera.swivelSpeed")} value={camera.swivelSpeed.toFixed(2)} />
        <Row label={t("proConfigs:panels.camera.transitionSpeed")} value={camera.transitionSpeed.toFixed(2)} />
      </div>
    </PanelBox>
  );
}

/* ─── Controls Panel ──────────────────────────────────────────────────────── */

function ControlsPanel({ controls, t }: { controls: NonNullable<ProPlayer["controls"]>; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <PanelBox icon={<Gamepad2 size={18} />} title={t("proConfigs:panels.controls.title")}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label={t("proConfigs:panels.controls.powerslide")} value={controls.powerslide || "-"} />
        <Row label={t("proConfigs:panels.controls.airRollLeft")} value={controls.airRollLeft || "-"} />
        <Row label={t("proConfigs:panels.controls.airRollRight")} value={controls.airRollRight || "-"} />
        <Row label={t("proConfigs:panels.controls.boost")} value={controls.boost || "-"} />
        <Row label={t("proConfigs:panels.controls.jump")} value={controls.jump || "-"} />
        <Row label={t("proConfigs:panels.controls.ballCam")} value={controls.ballCam || "-"} />
        <Row label={t("proConfigs:panels.controls.brake")} value={controls.brake || "-"} />
        <Row label={t("proConfigs:panels.controls.throttle")} value={controls.throttle || "-"} />
      </div>
    </PanelBox>
  );
}

/* ─── Deadzone Panel ──────────────────────────────────────────────────────── */

function DeadzonePanel({ deadzone, t }: { deadzone: NonNullable<ProPlayer["deadzone"]>; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <PanelBox icon={<Crosshair size={18} />} title={t("proConfigs:panels.deadzone.title")} lastUpdated={deadzone.lastUpdated} t={t}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <Row label={t("proConfigs:panels.deadzone.deadzoneShape")} value={deadzone.deadzoneShape} />
        <Row label={t("proConfigs:panels.deadzone.deadzone")} value={deadzone.deadzone.toFixed(2)} />
        <Row label={t("proConfigs:panels.deadzone.dodgeDeadzone")} value={deadzone.dodgeDeadzone.toFixed(2)} />
        <Row label={t("proConfigs:panels.deadzone.aerialSensitivity")} value={deadzone.aerialSensitivity.toFixed(2)} />
        <Row label={t("proConfigs:panels.deadzone.steeringSensitivity")} value={deadzone.steeringSensitivity.toFixed(2)} />
      </div>
    </PanelBox>
  );
}

/* ─── Hardware Panel ──────────────────────────────────────────────────────── */

function HardwarePanel({ hardware, t }: { hardware: NonNullable<ProPlayer["hardware"]>; t: ReturnType<typeof useTranslation>["t"] }) {
  return (
    <PanelBox icon={<Monitor size={18} />} title={t("proConfigs:panels.hardware.title")}>
      <div className="space-y-2 text-sm">
        <HardwareRow icon={<Gamepad2 size={14} />} label={t("proConfigs:panels.hardware.controller")} value={hardware.controller} />
        <HardwareRow icon={<Monitor size={14} />} label={t("proConfigs:panels.hardware.monitor")} value={hardware.monitor} />
        <HardwareRow icon={<Headphones size={14} />} label={t("proConfigs:panels.hardware.headset")} value={hardware.headset} />
      </div>
    </PanelBox>
  );
}

/* ─── Shared components ───────────────────────────────────────────────────── */

function PanelBox({
  icon,
  title,
  lastUpdated,
  t: panelT,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  lastUpdated?: string;
  t?: ReturnType<typeof useTranslation>["t"];
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-accent-primary">{icon}</span>
        <h3 className="font-semibold text-text-primary">{title}</h3>
        {lastUpdated && (
          <span className="ml-auto text-xs text-text-tertiary">
            {panelT ? panelT("proConfigs:panels.updated") : "Actualizado"}: {lastUpdated}
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
