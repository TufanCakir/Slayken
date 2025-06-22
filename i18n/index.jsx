// Datei: i18n/index.js (oder i18n.js)

import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

// Importiere Sprachdateien
import de from "./de.json";
import en from "./en.json";

// Neue Instanz erstellen
const i18n = new I18n({
  de,
  en,
});

// Standardkonfiguration
i18n.defaultLocale = "en";
i18n.locale = Localization.locale?.split("-")[0] || "en";
i18n.enableFallback = true; // fallback aktivieren

// ✅ Interpolation automatisch aktiviert in i18n-js, keine extra Option nötig

/**
 * Sprache ändern (z. B. bei Sprache-Umschalter)
 */
export function setI18nConfig(newLocale) {
  i18n.locale = newLocale;
}

/**
 * Übersetzungsfunktion
 * @param {string} key - z. B. "confirmLogin"
 * @param {object} config - z. B. { name: "Tufan" }
 * @returns {string}
 */
export function t(key, config = {}) {
  return i18n.t(key, config);
}

// Optional: Zugriff auf die Instanz
export { i18n as I18n };
