// src/hooks/useUpdateChecker.js
import { useEffect } from "react";
import * as Updates from "expo-updates";

export default function useUpdateChecker() {
  useEffect(() => {
    if (!__DEV__) {
      (async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {
          console.log("Fehler beim Prüfen von Updates:", e);
        }
      })();
    }
  }, []);
}
