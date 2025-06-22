import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GiftContext = createContext();

export const GiftProvider = ({ children }) => {
  const [collectedGifts, setCollectedGifts] = useState({}); // ✅ wichtig: NICHT undefined!

  useEffect(() => {
    const loadGifts = async () => {
      try {
        const json = await AsyncStorage.getItem("collectedGifts");
        if (json) setCollectedGifts(JSON.parse(json));
      } catch (e) {
        console.warn("Fehler beim Laden der Geschenke", e);
      }
    };
    loadGifts();
  }, []);

  const collectGift = async (id) => {
    const updated = { ...collectedGifts, [id]: true };
    setCollectedGifts(updated);
    await AsyncStorage.setItem("collectedGifts", JSON.stringify(updated));
  };

  const collectMultipleGifts = async (ids) => {
    const updated = { ...collectedGifts };
    ids.forEach((id) => {
      updated[id] = true;
    });
    setCollectedGifts(updated);
    await AsyncStorage.setItem("collectedGifts", JSON.stringify(updated));
  };

  return (
    <GiftContext.Provider
      value={{
        collectedGifts,
        collectGift,
        collectMultipleGifts,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

export const useGifts = () => useContext(GiftContext);
