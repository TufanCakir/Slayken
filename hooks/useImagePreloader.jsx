import { useState, useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";
import { Animated } from "react-native";

/**
 * Lädt Bilder persistent in Chunks, cached sie, gibt Fortschritt + lokale URIs + animierten Wert zurück.
 * @param {string[]} imageUrls - Die Bild-URLs.
 * @param {number} chunkSize - Anzahl paralleler Downloads (Default: 5)
 * @param {number} reloadFlag - Optionaler Trigger zum Neu-Laden
 * @returns {object} { loaded, progress, localUris, animatedProgress }
 */
export default function useImagePreloader(
  imageUrls = [],
  chunkSize = 5,
  reloadFlag = 0
) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [loaded, setLoaded] = useState(imageUrls.length === 0);
  const [localUris, setLocalUris] = useState([]);
  const isCancelled = useRef(false);
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      setLoaded(true);
      setLocalUris([]);
      setLoadedCount(0);
      Animated.timing(animatedProgress, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }).start();
      return;
    }

    isCancelled.current = false;
    setLoaded(false);
    setLoadedCount(0);
    setLocalUris([]);
    animatedProgress.setValue(0);

    const uniqueUrls = Array.from(new Set(imageUrls.filter(Boolean)));
    const urlToLocal = {};
    let loadedSoFar = 0;

    async function loadChunk(chunk) {
      await Promise.all(
        chunk.map(async (url) => {
          let localUri = "";
          if (url) {
            const fileUri = FileSystem.cacheDirectory + encodeURIComponent(url);
            try {
              const info = await FileSystem.getInfoAsync(fileUri);
              if (!info.exists || reloadFlag > 0) {
                if (info.exists)
                  await FileSystem.deleteAsync(fileUri, { idempotent: true });
                await FileSystem.downloadAsync(url, fileUri);
              }
              localUri = fileUri;
            } catch {
              localUri = url;
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
      const result = imageUrls.map((url) => urlToLocal[url] || "");
      if (!isCancelled.current) {
        setLocalUris(result);
        setLoaded(true);
      }
    })();

    return () => {
      isCancelled.current = true;
    };
  }, [JSON.stringify(imageUrls), chunkSize, reloadFlag]);

  // Fortschritt an Gesamtzahl der Original-URLs ausrichten
  const progress =
    imageUrls.length > 0
      ? Math.min(loadedCount, imageUrls.length) / imageUrls.length
      : 1;

  // Animate progress value
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return { loaded, progress, localUris, animatedProgress };
}
