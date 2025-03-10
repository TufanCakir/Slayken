// CrystalsContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Erstelle den Context
export const CrystalsContext = createContext();

// Provider-Komponente
export const CrystalsProvider = ({ children }) => {
  const [crystals, setCrystals] = useState(0);

  // Crystals aus AsyncStorage laden (beim Start)
  useEffect(() => {
    const loadCrystals = async () => {
      try {
        const storedCrystals = await AsyncStorage.getItem("crystals");
        if (storedCrystals !== null) {
          setCrystals(parseInt(storedCrystals, 10));
        }
      } catch (e) {
        console.error("Fehler beim Laden der Crystals:", e);
      }
    };
    loadCrystals();
  }, []);

  // Crystals in AsyncStorage speichern, wenn sich crystals ändern
  useEffect(() => {
    const saveCrystals = async () => {
      try {
        await AsyncStorage.setItem("crystals", crystals.toString());
      } catch (e) {
        console.error("Fehler beim Speichern der Crystals:", e);
      }
    };
    saveCrystals();
  }, [crystals]);

  // Funktion zum Hinzufügen von Crystals
  const addCrystals = (amount) => {
    setCrystals((prevCrystals) => prevCrystals + amount);
  };

  // Funktion zum Abziehen von Crystals
  const subtractCrystals = (amount) => {
    setCrystals((prevCrystals) => Math.max(prevCrystals - amount, 0));
  };

  // Funktion zum Zurücksetzen der Crystals
  const resetCrystals = () => {
    setCrystals(0);
  };

  return (
    <CrystalsContext.Provider
      value={{
        crystals,
        setCrystals,
        addCrystals,
        subtractCrystals,
        resetCrystals,
      }}
    >
      {children}
    </CrystalsContext.Provider>
  );
};
