// context/InventoryContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const POTIONS_KEY = "@potions";
const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [potions, setPotions] = useState(0);

  // Laden beim App-Start
  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(POTIONS_KEY);
        if (value !== null) setPotions(Number(value));
      } catch (e) {
        // Fehlerbehandlung (optional Logging)
      }
    })();
  }, []);

  // Immer speichern, wenn Potions sich ändern
  useEffect(() => {
    AsyncStorage.setItem(POTIONS_KEY, String(potions));
  }, [potions]);

  const addPotion = (amount) => setPotions((prev) => prev + amount);
  const usePotion = () => setPotions((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <InventoryContext.Provider value={{ potions, addPotion, usePotion }}>
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
