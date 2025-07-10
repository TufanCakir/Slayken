import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [unlocked, setUnlocked] = useState({}); // z.B. {skin_sylas_exclusive: true, ...}
  const STORAGE_KEY = "unlocked_items_v1";

  // Beim App-Start laden
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((str) => {
      if (str) setUnlocked(JSON.parse(str));
    });
  }, []);

  // Nach jedem Unlock speichern
  const persist = (next) =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  // Item freischalten
  const unlock = useCallback(
    async (itemOrId) => {
      const id = typeof itemOrId === "string" ? itemOrId : unlockKey(itemOrId);
      const next = { ...unlocked, [id]: true };
      setUnlocked(next);
      await persist(next);
    },
    [unlocked]
  );

  // Check: Ist das Item freigeschaltet?
  const isUnlocked = useCallback(
    (itemOrId) => {
      const id = typeof itemOrId === "string" ? itemOrId : unlockKey(itemOrId);
      return !!unlocked[id];
    },
    [unlocked]
  );

  // Hilfsfunktion: Generiert einen eindeutigen Key für das Item
  function unlockKey(item) {
    if (typeof item === "string") return item;
    if (item.category === "skin") return `skin_${item.id}`;
    if (item.category === "character") return `character_${item.characterId}`;
    // ... weitere Kategorien falls nötig
    return item.id;
  }

  return (
    <ShopContext.Provider value={{ unlocked, isUnlocked, unlock }}>
      {children}
    </ShopContext.Provider>
  );
}

// Custom Hook für einfachen Zugriff
export const useShop = () => useContext(ShopContext);
