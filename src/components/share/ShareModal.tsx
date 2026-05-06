import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useShareCard } from "@/hooks/useShareCard";
import type { ShareContext } from "@/lib/types";
import { Download, Copy, Share2, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ShareContext | null;
}

export function ShareModal({ isOpen, onClose, context }: ShareModalProps) {
  const { t } = useTranslation("share");
  const { generate, download, copyToClipboard, isGenerating } = useShareCard();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const buildPreview = useCallback(async () => {
    if (!context) return;
    const canvas = await generate(context, "/icon.png");
    if (canvas) {
      setPreviewUrl(canvas.toDataURL("image/png"));
    }
  }, [context, generate]);

  useEffect(() => {
    if (isOpen && context) {
      setPreviewUrl(null);
      setCopied(false);
      const tm = setTimeout(buildPreview, 100);
      return () => clearTimeout(tm);
    }
  }, [isOpen, context, buildPreview]);

  const handleDownload = () => {
    if (!context) return;
    const date = new Date().toISOString().slice(0, 10);
    download(`rl-stats-${context.type}-${date}.png`);
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.title", { defaultValue: "Compartir Resumen" })}
      description={t("modal.description", { defaultValue: "Generá una imagen lista para compartir en redes." })}
      size="lg"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            {t("modal.close", { defaultValue: "Cerrar" })}
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!previewUrl || isGenerating}
            leftIcon={copied ? Check : Copy}
          >
            {copied ? t("modal.copied", { defaultValue: "Copiado!" }) : t("modal.copyClipboard", { defaultValue: "Copiar" })}
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={!previewUrl || isGenerating}
            leftIcon={Download}
          >
            {t("modal.download", { defaultValue: "Descargar PNG" })}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-4">
        {isGenerating && !previewUrl && (
          <div className="flex items-center gap-2 text-text-secondary">
            <Share2 size={16} className="animate-spin" />
            {t("modal.generating", { defaultValue: "Generando imagen..." })}
          </div>
        )}
        {previewUrl && (
          <div className="w-full overflow-hidden rounded-xl border border-border-default bg-bg-base">
            <img
              src={previewUrl}
              alt="Share preview"
              className="mx-auto max-h-[60vh] w-auto object-contain"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
