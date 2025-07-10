// context/ShopContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SHOP_ITEMS from "../data/shopData.json";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [unlockedSkins, setUnlockedSkins] = useState([]);

  useEffect(() => {
    restorePurchases();
  }, []);

  // Prüft RevenueCat und merkt alle aktiven Entitlements lokal
  async function restorePurchases() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlements = customerInfo.entitlements.active || {};
      const unlocked = SHOP_ITEMS.filter((skin) =>
        Boolean(entitlements[skin.iapId])
      ).map((skin) => skin.id);
      setUnlockedSkins(unlocked);

      // Optional: Lokal merken (z. B. für Offline-Check)
      await AsyncStorage.setItem("@unlockedSkins", JSON.stringify(unlocked));
    } catch (e) {
      // Fallback: lokal laden
      const raw = await AsyncStorage.getItem("@unlockedSkins");
      if (raw) setUnlockedSkins(JSON.parse(raw));
    }
  }

  // Unlock nach Kauf (optional redundant, falls restorePurchases nach jedem Kauf ausgeführt wird)
  function unlockSkin(skinId) {
    setUnlockedSkins((prev) => Array.from(new Set([...prev, skinId])));
    AsyncStorage.setItem(
      "@unlockedSkins",
      JSON.stringify(Array.from(new Set([...unlockedSkins, skinId])))
    );
  }

  // Helper: ist Skin freigeschaltet?
  function isUnlocked(skin) {
    return unlockedSkins.includes(skin.id);
  }

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
