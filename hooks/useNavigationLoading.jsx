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

  // Memoisiere Callback und sorge für immer aktuelle Referenz auf onLoaded
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  // Loader beenden & Timeout aufräumen
  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setLoading(false);
    if (typeof onLoadedRef.current === "function") onLoadedRef.current();
  }, [setLoading]);

  // Hauptfunktion für onStateChange
  const onNavigationStateChange = useCallback(() => {
    setLoading(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(stopLoading, delay);
  }, [delay, setLoading, stopLoading]);

  // Cleanup beim Unmount: Ladeanzeige sicher beenden & Timeout clearen
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(false);
    };
    // setLoading NICHT aus den deps entfernen, sonst gibt es Linter-Warnung
  }, [setLoading]);

  return onNavigationStateChange;
}
