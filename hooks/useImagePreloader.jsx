import { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";

/**
 * Lädt Bilder persistent in Chunks, cached sie, gibt Fortschritt + lokale URIs zurück.
 * Entfernt doppelte Downloads, lässt die Reihenfolge/Länge der localUris wie imageUrls.
 * @param {string[]} imageUrls - Die Bild-URLs.
 * @param {number} chunkSize - Anzahl paralleler Downloads (Default: 5)
 * @returns {object} { loaded, progress, localUris }
 */
export default function useImagePreloader(imageUrls = [], chunkSize = 5) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loaded, setLoaded] = useState(imageUrls.length === 0);
  const [localUris, setLocalUris] = useState([]);
  const isCancelled = useRef(false);

  useEffect(() => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      setLoaded(true);
      setLocalUris([]);
      setLoadedCount(0);
      return;
    }

    isCancelled.current = false;
    setLoaded(false);
    setLoadedCount(0);
    setLocalUris([]);

    const total = imageUrls.length;
    const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean))); // Nur einzigartige und nicht-leere URLs
    const urlToLocal = {};
    let loadedSoFar = 0;

    // Chunked Download-Funktion für uniqueUrls
    async function loadChunk(chunk) {
      await Promise.all(
        chunk.map(async (url) => {
          let localUri = "";
          if (url) {
            const fileUri = FileSystem.cacheDirectory + encodeURIComponent(url);
            try {
              const info = await FileSystem.getInfoAsync(fileUri);
              if (!info.exists) await FileSystem.downloadAsync(url, fileUri);
              localUri = fileUri;
            } catch {
              localUri = url; // Fallback auf Remote-URL
            }
          }
          urlToLocal[url] = localUri;
          loadedSoFar++;
          if (!isCancelled.current) setLoadedCount(loadedSoFar);
        })
      );
    }

    (async () => {
      for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
        if (isCancelled.current) break;
        const chunk = uniqueUrls.slice(i, i + chunkSize);
        await loadChunk(chunk);
      }
      // Baue das finale localUris-Array wieder in Reihenfolge des Inputs:
      const result = imageUrls.map((url) => urlToLocal[url] || "");
      if (!isCancelled.current) {
        setLocalUris(result);
        setLoaded(true);
      }
    })();

    return () => {
      isCancelled.current = true;
    };
    // eslint-disable-next-line
  }, [JSON.stringify(imageUrls), chunkSize]);

  // Fortschritt an Gesamtzahl der Original-URLs ausrichten
  const progress =
    imageUrls.length > 0
      ? Math.min(loadedCount, imageUrls.length) / imageUrls.length
      : 1;

  return { loaded, progress, localUris };
}
