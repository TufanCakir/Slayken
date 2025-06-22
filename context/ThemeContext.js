import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import themeMapRaw from "../data/themeMap.json"; // enthält alle Themes

const ThemeContext = createContext();
const STORAGE_KEY = "uiThemeType";

export const ThemeProvider = ({ children }) => {
  const [uiThemeType, setUiThemeType] = useState(Object.keys(themeMapRaw)[0]); // erster verfügbarer Theme

  const baseTheme = themeMapRaw[uiThemeType];

  const bgImage = baseTheme.bgImage ? { uri: baseTheme.bgImage } : undefined;

  const theme = {
    ...baseTheme,
    ...(bgImage && { bgImage }),
  };

  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && themeMapRaw[saved]) {
          setUiThemeType(saved);
        }
      } catch (e) {
        console.warn("⚠️ Theme konnte nicht geladen werden:", e);
      }
    };
    loadThemeFromStorage();
  }, []);

  useEffect(() => {
    const saveThemeToStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, uiThemeType);
      } catch (e) {
        console.warn("⚠️ Theme konnte nicht gespeichert werden:", e);
      }
    };
    saveThemeToStorage();
  }, [uiThemeType]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        uiThemeType,
        setUiThemeType,
        availableThemes: Object.keys(themeMapRaw),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      "useThemeContext muss innerhalb eines ThemeProvider aufgerufen werden"
    );
  }
  return ctx;
};
