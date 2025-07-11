import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SHOP_ITEMS from "../data/shopData.json";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [unlocked, setUnlocked] = useState({}); // {unlock_skin_1: true, unlock_character_4: true ...}
  const [loading, setLoading] = useState(true);

  // Unlocks aus AsyncStorage laden
  const loadUnlocks = useCallback(async () => {
    setLoading(true);
    try {
      const keys = SHOP_ITEMS.flatMap((item) => [
        item.category === "skin"
          ? `unlock_skin_${item.id}`
          : item.characterId
          ? `unlock_character_${item.characterId}`
          : null,
      ]).filter(Boolean);

      const result = await AsyncStorage.multiGet(keys);
      const unlocksObj = {};
      result.forEach(([key, value]) => {
        if (key) unlocksObj[key] = value === "true";
      });
      setUnlocked(unlocksObj);
    } finally {
      setLoading(false);
    }
  }, []);

  // Unlock anlegen
  const unlockItem = async (item) => {
    const key =
      item.category === "skin"
        ? `unlock_skin_${item.id}`
        : `unlock_character_${item.characterId}`;
    await AsyncStorage.setItem(key, "true");
    setUnlocked((u) => ({ ...u, [key]: true }));
  };

  // Check ob gekauft/unlockt
  const isUnlocked = useCallback(
    (item) => {
      const key =
        item.category === "skin"
          ? `unlock_skin_${item.id}`
          : `unlock_character_${item.characterId}`;
      return !!unlocked[key];
    },
    [unlocked]
  );

  // Unlocks initial und bei Bedarf laden
  useEffect(() => {
    loadUnlocks();
  }, [loadUnlocks]);

  return (
    <ShopContext.Provider
      value={{
        unlocked,
        isUnlocked,
        unlockItem,
        reloadUnlocks: loadUnlocks,
        loading,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

// Hook für Zugriff
export const useShop = () => useContext(ShopContext);
