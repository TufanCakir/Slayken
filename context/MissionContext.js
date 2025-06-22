import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import missionData from "../data/missionData.json"; // ← richtige Missionsdaten

const MissionContext = createContext();

export const MissionProvider = ({ children }) => {
  const [missions, setMissions] = useState([]);

  const markMissionCompleted = (id) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: true } : m))
    );
  };

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("missions");
        if (saved) {
          setMissions(JSON.parse(saved));
        } else {
          setMissions(missionData); // ← korrekt hier eingesetzt
        }
      } catch (err) {
        console.error("Fehler beim Laden der Missionen:", err);
        setMissions(missionData); // Fallback
      }
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("missions", JSON.stringify(missions));
  }, [missions]);

  const collectReward = (id) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, collected: true } : m))
    );
  };

  const updateMission = (id, newData) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...newData } : m))
    );
  };

  return (
    <MissionContext.Provider
      value={{ missions, collectReward, updateMission, markMissionCompleted }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMissions = () => useContext(MissionContext);
