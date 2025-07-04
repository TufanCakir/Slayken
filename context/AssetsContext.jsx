import React, { createContext, useContext } from "react";

const AssetsContext = createContext();

export const AssetsProvider = ({ children, value }) => {
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
