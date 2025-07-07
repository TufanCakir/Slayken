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
    const uris = new Array(total);

    // Chunked Download-Funktion
    async function loadChunk(chunk, startIdx) {
      await Promise.all(
        chunk.map(async (url, idx) => {
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
          uris[startIdx + idx] = localUri;
          if (!isCancelled.current) setLoadedCount((prev) => prev + 1);
        })
      );
    }

    (async () => {
      for (let i = 0; i < total; i += chunkSize) {
        if (isCancelled.current) break;
        const chunk = imageUrls.slice(i, i + chunkSize);
        await loadChunk(chunk, i);
      }
      if (!isCancelled.current) {
        setLocalUris([...uris]);
        setLoaded(true);
      }
    })();

    return () => {
      isCancelled.current = true;
    };
    // eslint-disable-next-line
  }, [JSON.stringify(imageUrls), chunkSize]);
  // ^ JSON.stringify ist ok für Listen aus Props

  const progress = imageUrls.length > 0 ? loadedCount / imageUrls.length : 1;

  return { loaded, progress, localUris };
}
