import { useEffect } from "react";
import * as Updates from "expo-updates";

/**
 * Prüft beim App-Start automatisch auf Updates (nur im Release-Build).
 * Zeigt ein Overlay und installiert Updates automatisch.
 *
 * @param {function} setUpdateVisible - Setzt Sichtbarkeit des Overlays
 * @param {function} setUpdateDone - Setzt Status "Update abgeschlossen"
 */
export default function useUpdateChecker(setUpdateVisible, setUpdateDone) {
  useEffect(() => {
    let isActive = true;

    if (!__DEV__) {
      (async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            if (!isActive) return;
            setUpdateVisible(true);

            await Updates.fetchUpdateAsync();
            if (!isActive) return;
            setUpdateDone(true);

            setTimeout(() => {
              if (isActive) Updates.reloadAsync();
            }, 1000);
          }
        } catch (e) {
          if (isActive) setUpdateVisible(false);
          console.warn("Fehler beim Prüfen von Updates:", e);
        }
      })();
    }

    return () => {
      isActive = false;
    };
  }, [setUpdateVisible, setUpdateDone]);
}
