import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔑 Key
const STORAGE_KEY = '@slayken_coins';

// 📦 Context
const CoinsContext = createContext(undefined);

// 🚀 Provider
export function CoinsProvider({ children }) {
  const [coins, setCoins] = useState(0);

  // 📥 Laden
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) setCoins(parseInt(saved, 10) || 0);
      } catch (err) {
        if (__DEV__) console.warn('Coin Load Error:', err);
      }
    })();
  }, []);

  // 💾 Speichern
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, coins.toString());
      } catch (err) {
        if (__DEV__) console.warn('Coin Save Error:', err);
      }
    })();
  }, [coins]);

  // ➕ Hinzufügen
  const addCoins = useCallback(amount => {
    setCoins(prev => prev + amount);
  }, []);

  // ➖ Abziehen (nicht negativ)
  const removeCoins = useCallback(amount => {
    setCoins(prev => Math.max(0, prev - amount));
  }, []);

  return (
    <CoinsContext.Provider value={{ coins, addCoins, removeCoins }}>
      {children}
    </CoinsContext.Provider>
  );
}

// 🪙 Hook
export function useCoins() {
  const context = useContext(CoinsContext);
  if (!context) {
    throw new Error('useCoins must be used within CoinsProvider');
  }
  return context;
}
