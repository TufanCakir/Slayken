import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔑 Keys
const LEVEL_KEY = '@slayken_level';
const EXP_KEY = '@slayken_exp';

// 📦 Context
const AccountContext = createContext(undefined);

// 🚀 Provider
export function AccountProvider({ children }) {
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);

  // 🔄 Daten laden bei Start
  useEffect(() => {
    (async () => {
      try {
        const savedLevel = await AsyncStorage.getItem(LEVEL_KEY);
        const savedExp = await AsyncStorage.getItem(EXP_KEY);
        if (savedLevel) setLevel(parseInt(savedLevel, 10) || 1);
        if (savedExp) setExp(parseInt(savedExp, 10) || 0);
      } catch (err) {
        if (__DEV__) console.warn('Account Load Error:', err);
      }
    })();
  }, []);

  // 💾 Speichern bei Änderung
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(LEVEL_KEY, level.toString());
        await AsyncStorage.setItem(EXP_KEY, exp.toString());
      } catch (err) {
        if (__DEV__) console.warn('Account Save Error:', err);
      }
    })();
  }, [level, exp]);

  // ⭐️ EXP hinzufügen
  const addExp = useCallback(amount => {
    setExp(prevExp => {
      const total = prevExp + amount;
      const max = 100;
      if (total >= max) {
        setLevel(prev => prev + 1);
        return total - max;
      }
      return total;
    });
  }, []);

  return (
    <AccountContext.Provider value={{ level, exp, addExp }}>{children}</AccountContext.Provider>
  );
}

// 🔧 Hook
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within AccountProvider');
  }
  return context;
}
