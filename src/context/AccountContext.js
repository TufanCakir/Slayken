import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountContext = createContext({
  accountLevel: 1,
  setAccountLevel: () => {},
  incrementLevel: () => {},
});

export const AccountProvider = ({ children }) => {
  const [accountLevel, setAccountLevel] = useState(1);

  // Lade das Account-Level beim Mounten aus AsyncStorage
  useEffect(() => {
    const loadAccountLevel = async () => {
      try {
        const storedLevel = await AsyncStorage.getItem("accountLevel");
        if (storedLevel !== null) {
          setAccountLevel(parseInt(storedLevel, 10));
        }
      } catch (error) {
        console.error("Fehler beim Laden des Account-Levels:", error);
      }
    };

    loadAccountLevel();
  }, []);

  // Speichere das Account-Level, wenn es sich ändert
  useEffect(() => {
    const saveAccountLevel = async () => {
      try {
        await AsyncStorage.setItem("accountLevel", accountLevel.toString());
      } catch (error) {
        console.error("Fehler beim Speichern des Account-Levels:", error);
      }
    };

    saveAccountLevel();
  }, [accountLevel]);

  const incrementLevel = () => {
    setAccountLevel((prev) => prev + 1);
  };

  return (
    <AccountContext.Provider
      value={{ accountLevel, setAccountLevel, incrementLevel }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
