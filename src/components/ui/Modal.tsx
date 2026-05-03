import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ isOpen, onClose, title, description, children, footer, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      contentRef.current?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          "w-full rounded-xl border border-border-strong bg-bg-secondary shadow-level-3",
          sizes[size]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-border-subtle px-6 py-4">
            <div>
              {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
              {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
            </div>
            <Button variant="icon" onClick={onClose} aria-label="Close">
              <X size={18} />
            </Button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="border-t border-border-subtle px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
