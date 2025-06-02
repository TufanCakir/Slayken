// context/ChapterContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChapterContext = createContext();

const KEY_TYPE = "chapterType";
const KEY_INDEX_PREFIX = "chapterProgress_";

export function ChapterProvider({ children }) {
  const [chapterType, setChapterType] = useState("boss");
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper: storage key for a given type
  const indexKey = useCallback((type) => `${KEY_INDEX_PREFIX}${type}`, []);

  // Load saved type & index on mount
  useEffect(() => {
    async function loadProgress() {
      try {
        // Load type
        const savedType = await AsyncStorage.getItem(KEY_TYPE);
        const type = savedType || chapterType;
        setChapterType(type);

        // Load index for that type
        const savedIndex = await AsyncStorage.getItem(indexKey(type));
        if (savedIndex !== null && !isNaN(Number(savedIndex))) {
          setCurrentChapterIndex(Number(savedIndex));
        }
      } catch (e) {
        console.warn("Fehler beim Laden des Kapitelfortschritts:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [indexKey]);

  // When chapterType changes, load its saved index
  useEffect(() => {
    if (loading) return;
    (async () => {
      try {
        const savedIndex = await AsyncStorage.getItem(indexKey(chapterType));
        setCurrentChapterIndex(
          savedIndex !== null && !isNaN(Number(savedIndex))
            ? Number(savedIndex)
            : 0
        );
      } catch (e) {
        console.warn("Fehler beim Wechseln des Kapitels:", e);
      }
    })();
    // persist new type
    AsyncStorage.setItem(KEY_TYPE, chapterType).catch((e) =>
      console.warn("Fehler beim Speichern des Kapitels:", e)
    );
  }, [chapterType, indexKey, loading]);

  // Save index whenever it changes
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(
      indexKey(chapterType),
      currentChapterIndex.toString()
    ).catch((e) =>
      console.warn("Fehler beim Speichern des Kapitelfortschritts:", e)
    );
  }, [currentChapterIndex, chapterType, indexKey, loading]);

  const advanceChapter = useCallback(() => {
    setCurrentChapterIndex((prev) => prev + 1);
  }, []);

  const setChapterProgress = useCallback(
    (index, type) => {
      if (typeof type === "string" && type !== chapterType) {
        setChapterType(type);
      }
      if (typeof index === "number" && index >= 0) {
        setCurrentChapterIndex(index);
      }
    },
    [chapterType]
  );

  const value = useMemo(
    () => ({
      chapterType,
      currentChapterIndex,
      setChapterType,
      advanceChapter,
      setChapterProgress,
    }),
    [chapterType, currentChapterIndex, advanceChapter, setChapterProgress]
  );

  // While loading initial state, don't render children
  if (loading) {
    return null;
  }

  return (
    <ChapterContext.Provider value={value}>{children}</ChapterContext.Provider>
  );
}

export const useChapter = () => {
  const ctx = useContext(ChapterContext);
  if (!ctx) {
    throw new Error("useChapter must be used within a ChapterProvider");
  }
  return ctx;
};
