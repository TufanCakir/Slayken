// Datei: context/LanguageContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setI18nConfig } from "../i18n"; // ← korrekt importieren

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState("de");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem("appLanguage");
        const lang = saved || "de";
        setLanguageState(lang);
        setI18nConfig(lang);
      } catch (e) {
        console.warn("Fehler beim Laden der Sprache:", e);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLang) => {
    try {
      await AsyncStorage.setItem("appLanguage", newLang);
      setLanguageState(newLang);
      setI18nConfig(newLang);
    } catch (e) {
      console.error("Fehler beim Speichern der Sprache:", e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
