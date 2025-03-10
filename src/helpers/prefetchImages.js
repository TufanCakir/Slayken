import { Image } from "react-native";

/**
 * PrefetchImages iterates over a list of URI strings and loads
 * each available image into the cache.
 */
export const prefetchImages = (uris) => {
  uris.forEach((uri) => {
    if (uri) {
      console.log("Prefetch Bild:", uri);
      Image.prefetch(uri);
    }
  });
};
