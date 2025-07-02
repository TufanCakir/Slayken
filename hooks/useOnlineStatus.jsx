import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook zur Überwachung des Online-Status.
 * Gibt `true` (online), `false` (offline) oder `null` (Status unbekannt) zurück.
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Vorsicht: state.isInternetReachable kann beim ersten Call noch "null" sein
      if (state.isConnected === false) {
        setIsOnline(false);
      } else if (state.isInternetReachable === false) {
        setIsOnline(false);
      } else if (
        state.isConnected === true &&
        state.isInternetReachable !== false
      ) {
        setIsOnline(true);
      } else {
        setIsOnline(null); // Status noch unbekannt (z. B. beim ersten Mal)
      }
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
