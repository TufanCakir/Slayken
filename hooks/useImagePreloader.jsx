import { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";

/**
 * Lädt Bilder persistent in Chunks, cached sie, gibt Fortschritt + lokale URIs zurück.
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
    const total = imageUrls.length;
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

    // Hauptfunktion: Preloading + Caching
    (async () => {
      const uris = new Array(total).fill("");
      let loadedSoFar = 0;

      async function loadChunk(chunk, startIndex) {
        await Promise.all(
          chunk.map(async (url, i) => {
            if (!url) {
              uris[startIndex + i] = "";
              loadedSoFar++;
              if (!isCancelled.current) setLoadedCount(loadedSoFar);
              return;
            }
            const fileUri = FileSystem.cacheDirectory + encodeURIComponent(url);
            try {
              const info = await FileSystem.getInfoAsync(fileUri);
              if (!info.exists) {
                await FileSystem.downloadAsync(url, fileUri);
              }
              uris[startIndex + i] = fileUri;
            } catch {
              uris[startIndex + i] = url; // Notfall: nutze Remote-URL
            }
            loadedSoFar++;
            if (!isCancelled.current) setLoadedCount(loadedSoFar);
          })
        );
      }

      // Chunk für Chunk laden
      for (let i = 0; i < total; i += chunkSize) {
        const chunk = imageUrls.slice(i, i + chunkSize);
        await loadChunk(chunk, i);
        if (isCancelled.current) break;
      }

      if (!isCancelled.current) {
        setLocalUris(uris);
        setLoaded(true);
      }
    })();

    // Cleanup
    return () => {
      isCancelled.current = true;
    };
  }, [JSON.stringify(imageUrls), chunkSize]);
  // ^ JSON.stringify weil imageUrls ein Array ist (Referenz kann sich ändern, Inhalt nicht!)

  const total = imageUrls.length;
  const progress = total > 0 ? loadedCount / total : 1;

  return { loaded, progress, localUris };
}
