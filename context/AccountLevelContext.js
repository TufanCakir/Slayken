import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountLevelContext = createContext();

export function AccountLevelProvider({ children }) {
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);

  // Daten laden bei App-Start
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem("level");
        const storedXp = await AsyncStorage.getItem("xp");
        if (storedLevel) setLevel(parseInt(storedLevel));
        if (storedXp) setXp(parseInt(storedXp));
      } catch (e) {
        console.error("Fehler beim Laden des Account-Levels:", e);
      }
    };
    loadData();
  }, []);

  // Daten speichern bei Änderung
  useEffect(() => {
    AsyncStorage.setItem("level", level.toString());
    AsyncStorage.setItem("xp", xp.toString());
  }, [level, xp]);

  // XP hinzufügen und ggf. Level-Up auslösen
  const addXp = (amount) => {
    setXp((prevXp) => {
      let totalXp = prevXp + amount;
      let currentLevel = level;
      let currentXpToNext = xpToNextLevel;

      while (totalXp >= currentXpToNext) {
        totalXp -= currentXpToNext;
        currentLevel += 1;
        currentXpToNext = Math.floor(currentXpToNext * 1.2);
      }

      // Update state
      setLevel(currentLevel);
      setXpToNextLevel(currentXpToNext);

      return totalXp;
    });
  };

  const levelUp = () => {
    setLevel((prev) => prev + 1);
    setXpToNextLevel((prev) => Math.floor(prev * 1.2)); // XP-Anforderung steigt
  };

  return (
    <AccountLevelContext.Provider value={{ level, xp, xpToNextLevel, addXp }}>
      {children}
    </AccountLevelContext.Provider>
  );
}

export function useAccountLevel() {
  const context = useContext(AccountLevelContext);
  if (!context) {
    throw new Error(
      "useAccountLevel must be used within an AccountLevelProvider"
    );
  }
  return context;
}
