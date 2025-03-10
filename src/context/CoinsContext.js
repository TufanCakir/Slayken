// CoinsContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Erstelle den Context
export const CoinsContext = createContext();

// Provider-Komponente
export const CoinsProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);

  // Coins aus AsyncStorage laden (beim Start)
  useEffect(() => {
    const loadCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem("coins");
        if (storedCoins !== null) {
          setCoins(parseInt(storedCoins, 10));
        }
      } catch (e) {
        console.error("Fehler beim Laden der Coins:", e);
      }
    };
    loadCoins();
  }, []);

  // Coins in AsyncStorage speichern, wenn sich coins ändern
  useEffect(() => {
    const saveCoins = async () => {
      try {
        await AsyncStorage.setItem("coins", coins.toString());
      } catch (e) {
        console.error("Fehler beim Speichern der Coins:", e);
      }
    };
    saveCoins();
  }, [coins]);

  // Funktion zum Hinzufügen von Coins
  const addCoins = (amount) => {
    setCoins((prevCoins) => prevCoins + amount);
  };

  // Funktion zum Abziehen von Coins
  const subtractCoins = (amount) => {
    setCoins((prevCoins) => Math.max(prevCoins - amount, 0));
  };

  // Funktion zum Zurücksetzen der Coins
  const resetCoins = () => {
    setCoins(0);
  };

  return (
    <CoinsContext.Provider
      value={{ coins, setCoins, addCoins, subtractCoins, resetCoins }}
    >
      {children}
    </CoinsContext.Provider>
  );
};
