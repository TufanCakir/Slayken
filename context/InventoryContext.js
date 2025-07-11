// context/InventoryContext.js
import React, { createContext, useContext, useState } from "react";
const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [potions, setPotions] = useState(0);
  const addPotion = (amount) => setPotions((prev) => prev + amount);
  const usePotion = () => setPotions((prev) => (prev > 0 ? prev - 1 : 0));
  return (
    <InventoryContext.Provider value={{ potions, addPotion, usePotion }}>
      {children}
    </InventoryContext.Provider>
  );
}
export const useInventory = () => useContext(InventoryContext);
