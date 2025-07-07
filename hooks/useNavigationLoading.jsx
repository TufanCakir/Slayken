import { useRef, useCallback, useEffect } from "react";
import { useLoading } from "../context/LoadingContext";

/**
 * Hook für Navigation-Ladezustand.
 * @param {Object} options - Optionen
 * @param {number} options.delay - Verzögerung in ms bis zum Ausblenden
 * @param {function} [options.onLoaded] - Optionaler Callback nach Ladevorgang
 * @returns {() => void} onNavigationStateChange
 */
export default function useNavigationLoading({ delay = 1000, onLoaded } = {}) {
  const { setLoading } = useLoading();
  const timeoutRef = useRef(null);

  // Loader wirklich beenden & Timeout löschen
  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(false);
    if (typeof onLoaded === "function") onLoaded();
  }, [setLoading, onLoaded]);

  // Hauptfunktion für onStateChange
  const onNavigationStateChange = useCallback(() => {
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stopLoading, delay);
  }, [delay, setLoading, stopLoading]);

  // Cleanup beim Unmount: Ladeanzeige IMMER beenden
  useEffect(() => {
    return stopLoading;
  }, [stopLoading]);

  return onNavigationStateChange;
}
