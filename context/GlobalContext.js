import React, { createContext, useEffect, useState, useCallback, useContext } from 'react';
import backgroundList from '../data/background.json';

// 🔑 Default Context
const GlobalContext = createContext({
  globalBackground: null,
  setGlobalBackground: () => {},
});

// 🚀 Provider
export function GlobalProvider({ children }) {
  const [globalBackground, setGlobalBackground] = useState(null);

  // 🎨 Standardhintergrund setzen
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setGlobalBackground(backgroundList[0]?.image || null);
    }
  }, []);

  // Optional memoized setter (wenn du z. B. Übergabe an tiefe Komponenten planst)
  const updateBackground = useCallback(bg => {
    setGlobalBackground(bg);
  }, []);

  return (
    <GlobalContext.Provider value={{ globalBackground, setGlobalBackground: updateBackground }}>
      {children}
    </GlobalContext.Provider>
  );
}

// 🌐 Hook
export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within GlobalProvider');
  }
  return context;
}

export { GlobalContext };
