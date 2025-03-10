// PurchasedBackgroundsContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const PurchasedBackgroundsContext = createContext();

export const PurchasedBackgroundsProvider = ({ children }) => {
  const [purchasedBackgrounds, setPurchasedBackgrounds] = useState([]);

  // Lade die gekauften Hintergründe aus AsyncStorage beim Start
  useEffect(() => {
    const loadPurchasedBackgrounds = async () => {
      try {
        const storedBackgrounds = await AsyncStorage.getItem(
          "purchasedBackgrounds"
        );
        if (storedBackgrounds !== null) {
          setPurchasedBackgrounds(JSON.parse(storedBackgrounds));
        }
      } catch (error) {
        console.error("Error loading purchased backgrounds:", error);
      }
    };
    loadPurchasedBackgrounds();
  }, []);

  // Speichere die gekauften Hintergründe, wenn sich der Zustand ändert
  useEffect(() => {
    const savePurchasedBackgrounds = async () => {
      try {
        await AsyncStorage.setItem(
          "purchasedBackgrounds",
          JSON.stringify(purchasedBackgrounds)
        );
      } catch (error) {
        console.error("Error saving purchased backgrounds:", error);
      }
    };
    savePurchasedBackgrounds();
  }, [purchasedBackgrounds]);

  return (
    <PurchasedBackgroundsContext.Provider
      value={{ purchasedBackgrounds, setPurchasedBackgrounds }}
    >
      {children}
    </PurchasedBackgroundsContext.Provider>
  );
};
