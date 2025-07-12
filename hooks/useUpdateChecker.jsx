import { useEffect, useRef } from "react";
import * as Updates from "expo-updates";

/**
 * Prüft beim App-Start automatisch auf Updates (nur im Release-Build).
 * Zeigt ein Overlay und installiert Updates automatisch.
 *
 * @param {function} setUpdateVisible - Setzt Sichtbarkeit des Overlays
 * @param {function} setUpdateDone - Setzt Status "Update abgeschlossen"
 */
export default function useUpdateChecker(setUpdateVisible, setUpdateDone) {
  const setUpdateVisibleRef = useRef(setUpdateVisible);
  const setUpdateDoneRef = useRef(setUpdateDone);

  useEffect(() => {
    setUpdateVisibleRef.current = setUpdateVisible;
    setUpdateDoneRef.current = setUpdateDone;
  }, [setUpdateVisible, setUpdateDone]);

  useEffect(() => {
    let isActive = true;

    if (!__DEV__) {
      (async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable && isActive) {
            setUpdateVisibleRef.current(true);

            await Updates.fetchUpdateAsync();
            if (!isActive) return;

            setUpdateDoneRef.current(true);

            setTimeout(() => {
              if (isActive) Updates.reloadAsync();
            }, 1000); // Optional: Delay für Animation/UX
          }
        } catch (e) {
          if (isActive) {
            setUpdateVisibleRef.current(false);
            setUpdateDoneRef.current(false);
          }
          console.warn("[useUpdateChecker] Fehler beim Prüfen von Updates:", e);
        }
      })();
    }

    return () => {
      isActive = false;
    };
  }, []);
}
