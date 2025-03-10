// src/AppProviders.js
import React from "react";
import { CoinsProvider } from "./context/CoinsContext";
import { PurchasedBackgroundsProvider } from "./context/PurchasedBackgroundsContext";
import { BackgroundProvider } from "./context/BackgroundContext";

export default function AppProviders({ children }) {
  return (
    <CoinsProvider>
      <PurchasedBackgroundsProvider>
        <BackgroundProvider>{children}</BackgroundProvider>
      </PurchasedBackgroundsProvider>
    </CoinsProvider>
  );
}
