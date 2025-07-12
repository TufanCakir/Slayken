import { useEffect, useState, useRef } from "react";
import { useLoading } from "../context/LoadingContext";

// Zentrale Datenmodule-Definition
const dataModules = {
  bossData: () => import("../data/bossData.json"),
  eventData: () => import("../data/eventData.json"),
  tutorialData: () => import("../data/tutorialData.json"),
  themeMap: () => import("../data/themeMap.json"),
};

// Optional: globaler Cache (wird pro App-Laufzeit nur einmal geladen)
let globalCache = null;

/**
 * Lädt alle relevanten App-Daten asynchron und zentralisiert.
 * Gibt { data, error } zurück.
 */
export default function useDataLoader() {
  const { setLoading } = useLoading();
  const [data, setData] = useState(globalCache || {});
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (globalCache) {
      setLoading(false);
      setData(globalCache);
      return;
    }

    setLoading(true);

    const loadAllData = async () => {
      try {
        // Lade alle Datenmodule parallel
        const entries = Object.entries(dataModules);
        const loadedModules = await Promise.all(entries.map(([, fn]) => fn()));

        if (!isMounted.current) return;

        // Direktes Mapping zu Objekt
        const result = Object.fromEntries(
          entries.map(([key], idx) => [
            key,
            loadedModules[idx]?.default ?? loadedModules[idx],
          ])
        );

        globalCache = result; // Einmal global speichern
        setData(result);
      } catch (err) {
        if (isMounted.current) {
          setError(err);
          console.error("[useDataLoader] Fehler beim Laden der Daten:", err);
        }
      } finally {
        if (isMounted.current) {
          setTimeout(() => setLoading(false), 180); // sanfteres UI
        }
      }
    };

    loadAllData();

    return () => {
      isMounted.current = false;
    };
  }, [setLoading]);

  return { data, error };
}
