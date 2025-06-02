import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SummonContext = createContext();
const STORAGE_KEY = "summons";

export const SummonProvider = ({ children }) => {
  const [summons, setSummons] = useState([]);
  const [isSummoning, setIsSummoning] = useState(false);

  // 1. Beim App-Start: Summons aus AsyncStorage laden
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          // JSON.parse kann eine Array-Liste von Summons zurückgeben
          setSummons(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Fehler beim Laden der gespeicherten Summons:", error);
      }
    })();
  }, []);

  // 2. Immer, wenn sich `summons` ändert, synchronisieren wir es mit AsyncStorage
  useEffect(() => {
    // Sobald summons sich ändert, speichern wir es neu
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(summons));
      } catch (error) {
        console.error("Fehler beim Speichern der Summons:", error);
      }
    })();
  }, [summons]);

  /**
   * Fügt einen neuen Summon hinzu, falls er noch nicht existiert.
   * Verwendet funktionales Setzen, um stale Closures zu vermeiden.
   */
  const addSummon = async (newSummon) => {
    setIsSummoning(true);
    try {
      setSummons((prevSummons) => {
        // 3. Prüfen, ob die ID bereits existiert
        const exists = prevSummons.some((c) => c.id === newSummon.id);
        if (exists) {
          // Wenn schon vorhanden, kehren wir mit dem unveränderten Array zurück
          return prevSummons;
        }
        // Ansonsten hängen wir es ans Ende an
        return [...prevSummons, newSummon];
      });
      // -> Das `useEffect` mit [summons] sorgt dafür, dass AsyncStorage aktualisiert wird
    } catch (error) {
      console.error("Fehler beim Hinzufügen eines neuen Summons:", error);
    } finally {
      setIsSummoning(false);
    }
  };

  /**
   * Entfernt alle Summons (Reset).
   */
  const clearSummons = async () => {
    setSummons([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Summons:", error);
    }
  };

  return (
    <SummonContext.Provider
      value={{
        summons,
        addSummon,
        clearSummons,
        isSummoning,
        setIsSummoning,
      }}
    >
      {children}
    </SummonContext.Provider>
  );
};

export const useSummon = () => {
  const context = useContext(SummonContext);
  if (!context) {
    throw new Error(
      "useSummon muss innerhalb eines SummonProvider verwendet werden"
    );
  }
  return context;
};
