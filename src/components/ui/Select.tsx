import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  size?: "sm" | "md";
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  className,
  align = "left",
  size = "md",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayText = selectedOption?.label ?? placeholder;

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    },
    []
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  const height = size === "sm" ? "h-8" : "h-9";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div ref={ref} className={cn("relative inline-block", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          height,
          "flex items-center gap-1.5 rounded-md border bg-bg-surface px-3",
          textSize,
          "border-border-subtle text-text-primary",
          "hover:border-border-highlight transition-colors duration-150",
          "focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/50",
          open && "border-accent-primary ring-1 ring-accent-primary/50"
        )}
      >
        <span
          className={cn(
            "flex-1 text-left truncate",
            !selectedOption && "text-text-muted"
          )}
        >
          {displayText}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-text-muted transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-40 mt-1 min-w-[var(--radix-popover-trigger-width)] rounded-lg border border-border-subtle bg-bg-surface py-1 shadow-level-3 animate-in fade-in-0 zoom-in-95 origin-top",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2",
                  textSize,
                  "text-left transition-colors duration-75",
                  "hover:bg-surface-hover",
                  isSelected
                    ? "text-accent-primary font-medium"
                    : "text-text-secondary"
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && <Check size={14} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SelectWithLabelProps extends SelectProps {
  label: string;
}

export function SelectWithLabel({ label, ...selectProps }: SelectWithLabelProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-muted">{label}</label>
      <Select {...selectProps} />
    </div>
  );
}
