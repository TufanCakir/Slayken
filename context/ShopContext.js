import React, { createContext, useContext, useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import SHOP_ITEMS from "../data/shopData.json";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [unlockedSkins, setUnlockedSkins] = useState([]);
  const [ready, setReady] = useState(false);

  // RevenueCat EINMAL initialisieren
  useEffect(() => {
    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey;
    if (!apiKey) {
      console.warn("RevenueCat API Key fehlt in app.config.js");
      return;
    }
    Purchases.configure({ apiKey });
    setReady(true);
  }, []);

  // Käufe erst abfragen, wenn configure() fertig ist!
  useEffect(() => {
    if (ready) {
      restorePurchases();
    }
  }, [ready]);

  async function restorePurchases() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = customerInfo.entitlements.active || {};
      const unlocked = SHOP_ITEMS.filter((skin) =>
        Boolean(entitlements[skin.iapId])
      ).map((skin) => skin.id);
      setUnlockedSkins(unlocked);
      await AsyncStorage.setItem("@unlockedSkins", JSON.stringify(unlocked));
    } catch (e) {
      // Fallback: lokal laden
      const raw = await AsyncStorage.getItem("@unlockedSkins");
      if (raw) setUnlockedSkins(JSON.parse(raw));
    }
  }

  function unlockSkin(skinId) {
    setUnlockedSkins((prev) => {
      const updated = Array.from(new Set([...prev, skinId]));
      AsyncStorage.setItem("@unlockedSkins", JSON.stringify(updated));
      return updated;
    });
  }

  function isUnlocked(skin) {
    return unlockedSkins.includes(skin.id);
  }

  if (!ready) return null;

  return (
    <ShopContext.Provider
      value={{
        unlockedSkins,
        isUnlocked,
        restorePurchases,
        unlockSkin,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
