import { Languages } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Language } from "@/i18n/translations";

const options: Array<{ value: Language; label: string }> = [
  { value: "en", label: "English" },
  { value: "kn", label: "ಕನ್ನಡ" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="flex items-center gap-2 rounded-md border border-border/60 px-2 py-1 bg-background/40">
      <Languages className="w-4 h-4 text-muted-foreground" />
      <select
        aria-label="Language"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="bg-transparent text-xs outline-none font-medium"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
