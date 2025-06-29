import { useState, useEffect } from "react";
import * as FileSystem from "expo-file-system";

/**
 * Lädt Bilder persistent herunter und gibt Fortschritt + lokale URIs zurück.
 * @param {string[]} imageUrls - Liste der Bild-URLs
 * @returns {object} { loaded, progress, localUris }
 */
export default function useImagePreloader(imageUrls = []) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loaded, setLoaded] = useState(imageUrls.length === 0);
  const [localUris, setLocalUris] = useState([]);
  const total = imageUrls.length;

  useEffect(() => {
    if (total === 0) {
      setLoaded(true);
      setLocalUris([]);
      return;
    }

    let isCancelled = false;
    setLoaded(false);
    setLoadedCount(0);
    setLocalUris([]);

    (async () => {
      const uris = [];
      for (const url of imageUrls) {
        const fileUri = FileSystem.cacheDirectory + encodeURIComponent(url);
        try {
          const info = await FileSystem.getInfoAsync(fileUri);
          if (!info.exists) {
            await FileSystem.downloadAsync(url, fileUri);
          }
          uris.push(fileUri);
        } catch (e) {
          uris.push(url); // Fallback auf das Online-URL bei Fehler
        }
        if (!isCancelled) setLoadedCount((prev) => prev + 1);
      }
      if (!isCancelled) {
        setLocalUris(uris);
        setLoaded(true);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [imageUrls.join(",")]);

  const progress = total > 0 ? loadedCount / total : 1;

  return { loaded, progress, localUris };
}
