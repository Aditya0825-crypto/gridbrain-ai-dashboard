import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translateText, type Language } from "./translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
};

const STORAGE_KEY = "gridbrain-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const textNodeOriginals = new WeakMap<Text, string>();
const attributeOriginals = new WeakMap<HTMLElement, Record<string, string>>();
const translatableAttributes = ["placeholder", "title", "aria-label"];

function translateTree(root: Node, language: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    const textNode = root as Text;
    const parentTag = textNode.parentElement?.tagName;
    if (!textNode.textContent?.trim() || parentTag === "SCRIPT" || parentTag === "STYLE") {
      return;
    }

    if (!textNodeOriginals.has(textNode)) {
      textNodeOriginals.set(textNode, textNode.textContent);
    }

    const original = textNodeOriginals.get(textNode) ?? textNode.textContent;
    const translated = translateText(original, language);
    if (textNode.textContent !== translated) {
      textNode.textContent = translated;
    }
    return;
  }

  if (!(root instanceof HTMLElement)) {
    root.childNodes.forEach((child) => translateTree(child, language));
    return;
  }

  if (!attributeOriginals.has(root)) {
    const originalAttributes: Record<string, string> = {};
    for (const attributeName of translatableAttributes) {
      const value = root.getAttribute(attributeName);
      if (value) {
        originalAttributes[attributeName] = value;
      }
    }
    attributeOriginals.set(root, originalAttributes);
  }

  const originalAttributes = attributeOriginals.get(root) ?? {};
  for (const attributeName of translatableAttributes) {
    const originalValue = originalAttributes[attributeName];
    if (originalValue) {
        const translated = translateText(originalValue, language);
        if (root.getAttribute(attributeName) !== translated) {
          root.setAttribute(attributeName, translated);
        }
    }
  }

  root.childNodes.forEach((child) => translateTree(child, language));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "kn" ? "kn" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "kn" ? "kn" : "en";
  }, [language]);

  useEffect(() => {
    const root = document.getElementById("root");
    if (!root) {
      return;
    }

    translateTree(root, language);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTree(mutation.target, language);
        }
        mutation.addedNodes.forEach((node) => translateTree(node, language));
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "kn" : "en")),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
