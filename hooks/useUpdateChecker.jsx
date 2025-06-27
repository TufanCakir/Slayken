import { useEffect } from "react";
import * as Updates from "expo-updates";

export default function useUpdateChecker(setUpdateVisible, setUpdateDone) {
  useEffect(() => {
    if (!__DEV__) {
      (async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            setUpdateVisible(true);
            await Updates.fetchUpdateAsync();
            setUpdateDone(true); // ✅ Markiere als fertig
            setTimeout(() => {
              Updates.reloadAsync();
            }, 1000);
          }
        } catch (e) {
          console.log("Fehler beim Prüfen von Updates:", e);
          setUpdateVisible(false);
        }
      })();
    }
  }, []);
}
