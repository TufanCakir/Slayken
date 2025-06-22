// hooks/useNavigationLoading.js
import { useRef, useCallback, useEffect } from "react";
import { useLoading } from "../context/LoadingContext";

/**
 * Hook für Navigation-Ladezustand.
 * @param {{ delay?: number }} options
 * @returns {() => void} onNavigationStateChange
 */
export default function useNavigationLoading({ delay = 1000 } = {}) {
  const { setLoading } = useLoading();
  const timeoutRef = useRef(null);

  const onNavigationStateChange = useCallback(() => {
    // Immer auf "laden" setzen
    setLoading(true);

    // Vorherigen Timeout abbrechen
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Neues Timeout zum Ausblenden des Loaders
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, delay);
  }, [setLoading, delay]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return onNavigationStateChange;
}
