import React, { createContext, useContext, useState, useCallback } from "react";

const AssetsContext = createContext();

export const AssetsProvider = ({ children }) => {
  const [reloadFlag, setReloadFlag] = useState(0);

  const reloadAssets = useCallback(() => {
    setReloadFlag((prev) => prev + 1);
  }, []);

  const value = {
    reloadFlag,
    reloadAssets,
    imageMap: {}, // du kannst hier optional einen initialen leeren Wert lassen
  };

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
};

export const useAssets = () => {
  const context = useContext(AssetsContext);
  if (!context) {
    throw new Error(
      "useAssets muss innerhalb eines AssetsProvider verwendet werden!"
    );
  }
  return context;
};
