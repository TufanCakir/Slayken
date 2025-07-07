import { useEffect, useState, useRef } from "react";
import { useLoading } from "../context/LoadingContext";

// Zentrale Datenmodule-Definition
const dataModules = {
  bossData: () => import("../data/bossData.json"),
  eventData: () => import("../data/eventData.json"),
  tutorialData: () => import("../data/tutorialData.json"),
  themeMap: () => import("../data/themeMap.json"),
};

/**
 * Lädt alle relevanten App-Daten asynchron und zentralisiert.
 * Gibt { data, error } zurück.
 */
export default function useDataLoader() {
  const { setLoading } = useLoading();
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);

    const loadAllData = async () => {
      try {
        // Lade alle Datenmodule parallel
        const entries = Object.entries(dataModules);
        const loadedModules = await Promise.all(entries.map(([, fn]) => fn()));

        if (!isMounted.current) return;

        // Mapping zu finalem Datenobjekt
        const result = entries.reduce((acc, [key], idx) => {
          acc[key] = loadedModules[idx]?.default ?? loadedModules[idx];
          return acc;
        }, {});

        setData(result);
      } catch (err) {
        if (isMounted.current) {
          setError(err);
          console.error("Fehler beim Laden der Daten:", err);
        }
      } finally {
        if (isMounted.current) {
          setTimeout(() => setLoading(false), 200); // sanfteres UI
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
