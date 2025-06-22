// utils/missionUtils.js
import { useMissions } from "../../context/MissionContext";

export const useCompleteMissionOnce = () => {
  const { missions, markMissionCompleted } = useMissions();

  return (id) => {
    const alreadyDone = missions.find((m) => m.id === id)?.completed;
    if (!alreadyDone) {
      markMissionCompleted(id);
    }
  };
};
