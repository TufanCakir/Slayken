import * as Localization from "expo-localization";
import { I18n } from "i18n-js"; // Importiere die Klasse, nicht default

import de from "./de.json";
import en from "./en.json";

// Erstelle eine eigene Instanz
const i18n = new I18n({
  de,
  en,
});

// Konfiguration
i18n.fallbacks = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.locale.split("-")[0] || "en";

// Sprache später ändern
export function setI18nConfig(newLocale) {
  i18n.locale = newLocale;
}

// Übersetzungsfunktion
export function t(key, config = {}) {
  return i18n.t(key, config);
}

// Optional: Zugriff auf die Instanz
export { i18n as I18n };
