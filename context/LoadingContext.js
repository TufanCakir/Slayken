import { createContext, useContext, useState, useMemo } from "react";

// 1. Context Default Value, damit IDE-Autocomplete & Typen stimmen
const LoadingContext = createContext({
  loading: false,
  setLoading: () => {},
  // falls erweitert: startLoading, stopLoading
});

export const LoadingProvider = ({ children }) => {
  // 2. Optional: Lade-Counter für mehrere parallele Loads (Profi-Feature)
  const [counter, setCounter] = useState(0);

  const loading = counter > 0;

  const startLoading = () => setCounter((c) => c + 1);
  const stopLoading = () => setCounter((c) => Math.max(c - 1, 0));

  // 3. Optional: Classic-API für setLoading (kompatibel zu deinem Code)
  const setLoading = (value) => setCounter(value ? 1 : 0);

  // 4. Memoize Context Value!
  const value = useMemo(
    () => ({ loading, setLoading, startLoading, stopLoading }),
    [loading]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

// 5. Custom Hook mit Fehlerprüfung
export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error("useLoading must be used within a LoadingProvider");
  return ctx;
};
