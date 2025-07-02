import { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";

/**
 * Lädt Bilder in Chunks persistent herunter und gibt Fortschritt + lokale URIs zurück.
 * @param {string[]} imageUrls - Liste der Bild-URLs
 * @param {number} chunkSize - Wie viele Bilder pro Chunk? (Default: 5)
 * @returns {object} { loaded, progress, localUris }
 */
export default function useImagePreloader(imageUrls = [], chunkSize = 5) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loaded, setLoaded] = useState(imageUrls.length === 0);
  const [localUris, setLocalUris] = useState([]);
  const isCancelled = useRef(false);
  const total = imageUrls.length;

  useEffect(() => {
    if (total === 0) {
      setLoaded(true);
      setLocalUris([]);
      setLoadedCount(0);
      return;
    }

    isCancelled.current = false;
    setLoaded(false);
    setLoadedCount(0);
    setLocalUris([]);

    // CHUNK-LOADER
    (async () => {
      const uris = new Array(imageUrls.length).fill("");
      let loadedSoFar = 0;

      // Hilfsfunktion für einen Chunk
      async function loadChunk(chunk, startIndex) {
        // Parallel laden per Promise.all
        await Promise.all(
          chunk.map(async (url, i) => {
            if (!url) {
              uris[startIndex + i] = "";
              return;
            }
            const fileUri = FileSystem.cacheDirectory + encodeURIComponent(url);
            try {
              const info = await FileSystem.getInfoAsync(fileUri);
              if (!info.exists) {
                await FileSystem.downloadAsync(url, fileUri);
              }
              uris[startIndex + i] = fileUri;
            } catch (e) {
              uris[startIndex + i] = url; // Fallback: Remote-URL
            }
            // Nach JEDEM Bild Fortschritt erhöhen!
            loadedSoFar++;
            if (!isCancelled.current) setLoadedCount(loadedSoFar);
          })
        );
      }

      // Über alle Chunks iterieren
      for (let i = 0; i < imageUrls.length; i += chunkSize) {
        const chunk = imageUrls.slice(i, i + chunkSize);
        await loadChunk(chunk, i); // Warten bis dieser Chunk fertig ist
        if (isCancelled.current) break;
      }

      if (!isCancelled.current) {
        setLocalUris(uris);
        setLoaded(true);
      }
    })();

    return () => {
      isCancelled.current = true;
    };
    // Das Dependency-Array sollte stabil sein:
  }, [JSON.stringify(imageUrls), chunkSize]);

  const progress = total > 0 ? loadedCount / total : 1;

  return { loaded, progress, localUris };
}
