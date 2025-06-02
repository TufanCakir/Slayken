import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 1. Kontext erstellen
const CrystalContext = createContext();

// 2. Provider-Komponente
export const CrystalProvider = ({ children }) => {
  const [crystals, setCrystals] = useState(0);

  // Kristalle beim Start laden
  useEffect(() => {
    const loadCrystals = async () => {
      try {
        const storedCrystals = await AsyncStorage.getItem("crystals");
        if (storedCrystals !== null) {
          setCrystals(parseInt(storedCrystals));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Kristalle:", error);
      }
    };

    loadCrystals();
  }, []);

  // Änderungen speichern
  useEffect(() => {
    const saveCrystals = async () => {
      try {
        await AsyncStorage.setItem("crystals", crystals.toString());
      } catch (error) {
        console.error("Fehler beim Speichern der Kristalle:", error);
      }
    };

    saveCrystals();
  }, [crystals]);

  const addCrystals = (amount) => {
    setCrystals((prev) => prev + amount);
  };

  const spendCrystals = (amount) => {
    setCrystals((prev) => Math.max(prev - amount, 0));
  };

  return (
    <CrystalContext.Provider value={{ crystals, addCrystals, spendCrystals }}>
      {children}
    </CrystalContext.Provider>
  );
};

// 3. Custom Hook für einfachere Nutzung
export const useCrystals = () => useContext(CrystalContext);
