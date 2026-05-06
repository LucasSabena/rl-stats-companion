import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/Select";

const LANGUAGES: SelectOption[] = [
  { value: "es", label: "Espanol" },
  { value: "en", label: "English" },
  { value: "pt", label: "Portugues" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation("settings");

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-base px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Globe size={16} className="text-text-muted" />
        <div>
          <p className="text-sm font-medium text-text-secondary">Idioma / Language</p>
        </div>
      </div>
      <Select
        options={LANGUAGES}
        value={i18n.language?.split("-")[0] ?? "es"}
        onChange={handleChange}
        size="sm"
      />
    </div>
  );
}