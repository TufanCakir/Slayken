import { useEffect, useState, useRef } from "react";
import { useLoading } from "../context/LoadingContext";

// Daten-Module zentral
const dataModules = {
  bossData: () => import("../data/bossData.json"),
  eventData: () => import("../data/eventData.json"),
  tutorialData: () => import("../data/tutorialData.json"),
  themeMap: () => import("../data/themeMap.json"),
};

/**
 * Hook für das zentrale Laden aller relevanten Daten.
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

    (async () => {
      try {
        const entries = Object.entries(dataModules);
        // Lade alle Module parallel
        const modules = await Promise.all(
          entries.map(([, loader]) => loader())
        );

        // Falls der Hook noch gemountet ist
        if (!isMounted.current) return;

        // Exporte sauber in ein Objekt mappen
        const loadedData = entries.reduce((acc, [key], idx) => {
          acc[key] = modules[idx]?.default ?? modules[idx];
          return acc;
        }, {});

        setData(loadedData);
      } catch (err) {
        if (isMounted.current) {
          setError(err);
          console.error("Fehler beim Laden der Daten:", err);
        }
      } finally {
        // sanfteres Laden (kurze Verzögerung), nur wenn gemountet
        if (isMounted.current) {
          setTimeout(() => setLoading(false), 220);
        }
      }
    })();

    // Cleanup: Kein State-Update nach Unmount
    return () => {
      isMounted.current = false;
    };
  }, [setLoading]);

  return { data, error };
}
