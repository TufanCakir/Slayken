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

  const clearLoader = useCallback(() => {
    setLoading(false);
    if (typeof onLoaded === "function") onLoaded();
  }, [setLoading, onLoaded]);

  const onNavigationStateChange = useCallback(() => {
    setLoading(true);

    // Bereits laufenden Timeout stoppen
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Nach `delay` das Laden beenden
    timeoutRef.current = setTimeout(clearLoader, delay);
  }, [delay, clearLoader, setLoading]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        setLoading(false); // Sicherheitshalber beim Unmount
      }
    };
    // eslint-disable-next-line
  }, [setLoading]);

  return onNavigationStateChange;
}
