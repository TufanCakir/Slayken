// hooks/useDataLoader.js
import { useEffect, useState } from "react";
import { useLoading } from "../context/LoadingContext";

const dataModules = {
  bossData: () => import("../data/bossData.json"),
  characterData: () => import("../data/characterData.json"),
  eventData: () => import("../data/eventData.json"),
  seasonalData: () => import("../data/seasonalData.json"),
  tutorialData: () => import("../data/tutorialData.json"),
  teamData: () => import("../data/teamData.json"),
  themeMap: () => import("../data/themeMap.json"),
  bossImages: () => import("../data/bossImages.json"),
};

export default function useDataLoader() {
  const { setLoading } = useLoading();
  const [data, setData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    (async () => {
      try {
        // Lade alle Module parallel
        const entries = Object.entries(dataModules);
        const promises = entries.map(([, loader]) => loader());
        const modules = await Promise.all(promises);

        if (!isMounted) return;

        // Packe die Default-Exporte in ein Objekt
        const loadedData = entries.reduce((acc, [key], idx) => {
          acc[key] = modules[idx].default ?? modules[idx];
          return acc;
        }, {});

        setData(loadedData);
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
        if (isMounted) setError(err);
      } finally {
        if (!isMounted) return;
        // sanfter Übergang
        setTimeout(() => setLoading(false), 300);
      }
    })();

    return () => {
      // Verhindert State-Updates nach Unmount
      isMounted = false;
    };
  }, [setLoading]);

  return { data, error };
}
