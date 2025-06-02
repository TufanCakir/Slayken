// Datei: context/ThemeContext.js
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import themeMapRaw from "../data/themeMap.json";

const ThemeContext = createContext();
const STORAGE_KEY = "uiThemeType";

export const ThemeProvider = ({ children }) => {
  // 1. uiThemeType legt fest, welches Theme wir aktuell nutzen ("dark" oder "light").
  const [uiThemeType, setUiThemeType] = useState("dark");

  // 2. Basis-Objekt aus JSON (z. B. { accentColor, bgDark, textColor, shadowColor })
  const baseTheme = themeMapRaw[uiThemeType] || themeMapRaw["dark"];

  // 3. bgImage wird dynamisch gesetzt: entweder bgDark-URL oder bgLight-URL
  //    Wir packen bgImage als Objekt { uri } hinein, damit es direkt in <Image source={theme.bgImage} /> funktioniert.
  const bgImage =
    uiThemeType === "dark"
      ? { uri: baseTheme.bgDark }
      : { uri: baseTheme.bgLight };

  // 4. Zusammensetzen des finalen "theme"-Objekts, das alle nötigen Properties enthält:
  //    - accentColor, textColor, shadowColor (wie aus JSON)
  //    - bgDark/bgLight (falls du sie noch einzeln benötigst)
  //    - neu: bgImage (als { uri: ... })
  const theme = {
    ...baseTheme,
    bgImage,
  };

  // 5. Beim Start aus AsyncStorage laden (falls der User schon ein Theme gewählt hatte)
  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved && themeMapRaw[saved]) {
          setUiThemeType(saved);
        }
      } catch (e) {
        console.warn("Theme konnte nicht geladen werden:", e);
      }
    };
    loadThemeFromStorage();
  }, []);

  // 6. Wenn sich uiThemeType ändert, speichern wir ihn erneut in AsyncStorage
  useEffect(() => {
    const saveThemeToStorage = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, uiThemeType);
      } catch (e) {
        console.warn("Theme konnte nicht gespeichert werden:", e);
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
