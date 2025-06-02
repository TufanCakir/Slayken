import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Context erstellen
const CoinContext = createContext();

// 2. Provider-Komponente
export const CoinProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);

  // Beim Start laden
  useEffect(() => {
    const loadCoins = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem("coins");
        if (storedCoins !== null) {
          setCoins(parseInt(storedCoins));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Coins:", error);
      }
    };

    loadCoins();
  }, []);

  // Beim Ändern speichern
  useEffect(() => {
    const saveCoins = async () => {
      try {
        await AsyncStorage.setItem("coins", coins.toString());
      } catch (error) {
        console.error("Fehler beim Speichern der Coins:", error);
      }
    };

    saveCoins();
  }, [coins]);

  const addCoins = (amount) => {
    setCoins((prev) => prev + amount);
  };

  const spendCoins = (amount) => {
    setCoins((prev) => Math.max(prev - amount, 0));
  };

  return (
    <CoinContext.Provider value={{ coins, addCoins, spendCoins }}>
      {children}
    </CoinContext.Provider>
  );
};

// 3. Custom Hook zur einfacheren Verwendung
export const useCoins = () => useContext(CoinContext);
