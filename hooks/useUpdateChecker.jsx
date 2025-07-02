import { useEffect } from "react";
import * as Updates from "expo-updates";

/**
 * Prüft automatisch beim App-Start auf Updates (nur im Release-Build!).
 * Zeigt ein Overlay, lädt und installiert das Update automatisch.
 *
 * @param {function} setUpdateVisible - Zeigt das Update-Overlay
 * @param {function} setUpdateDone - Markiert den Abschluss des Updates
 */
export default function useUpdateChecker(setUpdateVisible, setUpdateDone) {
  useEffect(() => {
    let isActive = true; // Schutz gegen SetState nach Unmount

    if (!__DEV__) {
      (async () => {
        try {
          // 1. Checken ob ein Update verfügbar ist
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            setUpdateVisible(true);
            // 2. Downloaden
            await Updates.fetchUpdateAsync();
            // 3. Zeige "Update abgeschlossen"
            setUpdateDone(true);

            // 4. Kurze Pause für UX (z.B. 1 Sekunde)
            setTimeout(() => {
              if (isActive) {
                Updates.reloadAsync();
              }
            }, 1000);
          }
        } catch (e) {
          console.warn("Fehler beim Prüfen von Updates:", e);
          if (isActive) setUpdateVisible(false);
        }
      })();
    }

    return () => {
      isActive = false;
    };
  }, [setUpdateVisible, setUpdateDone]);
}
