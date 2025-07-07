import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bossData from "../data/bossData.json";

// --------- StagesData automatisch aus bossData ---------
const stagesData = bossData.map((boss, idx) => ({
  id: idx + 1,
  name: boss.name,
  type: idx === bossData.length - 1 ? "boss" : "normal",
  bossId: idx,
}));

function getDefaultStageProgress() {
  return stagesData.map((stage, idx) => ({
    id: stage.id,
    unlocked: idx === 0,
    stars: 0,
    completed: false,
  }));
}

const StageContext = createContext();

export function StageProvider({ children }) {
  const [stageProgress, setStageProgress] = useState(getDefaultStageProgress());
  const STORAGE_KEY = "@stage_progress";

  // ---------- Lade gespeicherten Fortschritt ----------
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setStageProgress(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Fehler beim Laden des Stage-Fortschritts:", e);
      }
    })();
  }, []);

  // ---------- Automatisch speichern bei Änderungen ----------
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stageProgress));
      } catch (e) {
        console.error("Fehler beim Speichern des Stage-Fortschritts:", e);
      }
    })();
  }, [stageProgress]);

  // ---------- Methoden ----------
  const updateStage = useCallback((id, updates) => {
    setStageProgress((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, ...updates } : stage))
    );
  }, []);

  const resetStages = useCallback(() => {
    setStageProgress(getDefaultStageProgress());
  }, []);

  return (
    <StageContext.Provider
      value={{
        stageProgress,
        setStageProgress,
        updateStage,
        resetStages,
        stagesData,
      }}
    >
      {children}
    </StageContext.Provider>
  );
}

export function useStage() {
  return useContext(StageContext);
}
