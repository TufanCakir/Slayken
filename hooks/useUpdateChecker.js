// src/hooks/useUpdateChecker.js
import { useEffect } from "react";
import * as Updates from "expo-updates";

/**
 * Führt einen Update-Check durch und zeigt bei Bedarf eine Ladeanzeige über `setUpdateUIVisible`.
 * @param {Function} setUpdateUIVisible - State Setter für das Update-Overlay (boolean)
 */
export default function useUpdateChecker(setUpdateUIVisible) {
  useEffect(() => {
    if (!__DEV__) {
      (async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            // Ladeanzeige einblenden
            setUpdateUIVisible(true);

            // Update herunterladen
            await Updates.fetchUpdateAsync();

            // Kurze Verzögerung für UX (optional)
            setTimeout(() => {
              Updates.reloadAsync(); // App neustarten
            }, 1000);
          }
        } catch (e) {
          console.log("Fehler beim Prüfen von Updates:", e);
          setUpdateUIVisible(false); // Fehlerfall: UI ausblenden
        }
      })();
    }
  }, []);
}
