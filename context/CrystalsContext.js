import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔑 Key
const STORAGE_KEY = '@slayken_crystals';

// 📦 Context
const CrystalsContext = createContext(undefined);

// 🚀 Provider
export function CrystalsProvider({ children }) {
  const [crystals, setCrystals] = useState(0);

  // 📥 Laden
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved !== null) setCrystals(parseInt(saved, 10) || 0);
      } catch (err) {
        if (__DEV__) console.warn('Crystal Load Error:', err);
      }
    })();
  }, []);

  // 💾 Speichern
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, crystals.toString());
      } catch (err) {
        if (__DEV__) console.warn('Crystal Save Error:', err);
      }
    })();
  }, [crystals]);

  // ➕ Hinzufügen
  const addCrystals = useCallback(amount => {
    setCrystals(prev => prev + amount);
  }, []);

  // ➖ Abziehen (nicht negativ)
  const removeCrystals = useCallback(amount => {
    setCrystals(prev => Math.max(0, prev - amount));
  }, []);

  return (
    <CrystalsContext.Provider value={{ crystals, addCrystals, removeCrystals }}>
      {children}
    </CrystalsContext.Provider>
  );
}

// 🧊 Hook
export function useCrystals() {
  const context = useContext(CrystalsContext);
  if (!context) {
    throw new Error('useCrystals must be used within CrystalsProvider');
  }
  return context;
}
