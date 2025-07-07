import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook zur Überwachung des Online-Status.
 * Gibt `true` (online), `false` (offline) oder `null` (Status unbekannt) zurück.
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(null);

  // Hilfsfunktion für einheitliche Status-Logik
  function resolveOnlineStatus(state) {
    if (state.isConnected === false) return false;
    if (state.isInternetReachable === false) return false;
    if (state.isConnected === true && state.isInternetReachable !== false)
      return true;
    return null; // Status noch unbekannt
  }

  useEffect(() => {
    const handleStatus = (state) => setIsOnline(resolveOnlineStatus(state));
    const unsubscribe = NetInfo.addEventListener(handleStatus);
    return unsubscribe;
  }, []);

  return isOnline;
}
