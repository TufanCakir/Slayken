import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Wertet NetInfo-Objekt robust aus:
 * - online: true   → Internet sicher erreichbar
 * - offline: false → sicher offline (kein Netz oder nicht erreichbar)
 * - null           → Status nicht eindeutig feststellbar
 */
function resolveOnlineStatus(state) {
  if (!state) return null;
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  if (state.isConnected === true && state.isInternetReachable !== false)
    return true;
  return null; // Status noch unbekannt
}

/**
 * Hook zur Überwachung des Online-Status.
 * Gibt `true` (online), `false` (offline) oder `null` (Status unbekannt) zurück.
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(null);

  useEffect(() => {
    let mounted = true;

    // Setze initialen Status sofort (nicht erst auf Event warten)
    NetInfo.fetch().then((state) => {
      if (mounted) setIsOnline(resolveOnlineStatus(state));
    });

    // Abonniere Status-Änderungen
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (mounted) setIsOnline(resolveOnlineStatus(state));
    });

    return () => {
      mounted = false;
      unsubscribe && unsubscribe();
    };
  }, []);

  return isOnline;
}
