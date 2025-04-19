import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔑 Speicher-Key
const STORAGE_KEY = '@slayken_rarity_config';

// 🌟 Standard-Raritäten
const defaultRarities = {
  N: { color: '#AAAAAA', label: 'Normal' },
  R: { color: '#1E90FF', label: 'Rare' },
  SR: { color: '#BA55D3', label: 'Super Rare' },
  SSR: { color: '#FFD700', label: 'Super Super Rare', glow: '#FFFACD' },
};

// 📦 Context
const RarityContext = createContext(undefined);

// 🚀 Provider
export function RarityProvider({ children }) {
  const [rarities, setRarities] = useState(defaultRarities);

  // 📥 Laden bei Start
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            setRarities(parsed);
          }
        }
      } catch (err) {
        if (__DEV__) console.warn('Rarity Load Error:', err);
      }
    })();
  }, []);

  // 💾 Speichern bei Änderung
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rarities));
      } catch (err) {
        if (__DEV__) console.warn('Rarity Save Error:', err);
      }
    })();
  }, [rarities]);

  // ✏️ Aktualisieren
  const updateRarity = useCallback((key, newValues) => {
    setRarities(prev => ({
      ...prev,
      [key]: { ...prev[key], ...newValues },
    }));
  }, []);

  return (
    <RarityContext.Provider value={{ rarities, updateRarity }}>{children}</RarityContext.Provider>
  );
}

// 🪄 Hook
export function useRarity() {
  const context = useContext(RarityContext);
  if (!context) {
    throw new Error('useRarity must be used within a RarityProvider');
  }
  return context;
}
