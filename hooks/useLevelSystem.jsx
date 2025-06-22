// hooks/useLevelSystem.js
import { useCallback } from "react";
import { skillPool } from "../data/skillPool";

const LEVEL_CAP = 50;

const baseStats = {
  strength: 10,
  defense: 8,
  agility: 5,
  intelligence: 4,
};

function calculateNextLevelExp(level) {
  return 100 + level * 50;
}

function scaleStats(level) {
  return {
    strength: baseStats.strength + level * 2,
    defense: baseStats.defense + level * 1.5,
    agility: baseStats.agility + level,
    intelligence: baseStats.intelligence + level,
  };
}

function unlockSkills(level, element) {
  return skillPool.filter(
    (skill) =>
      level >= skill.level && (!skill.element || skill.element === element)
  );
}

export function useLevelSystem() {
  const gainExp = useCallback((character, amount) => {
    let { exp, expToNextLevel, level, element } = character;
    exp += amount;

    while (exp >= expToNextLevel && level < LEVEL_CAP) {
      exp -= expToNextLevel;
      level++;
      expToNextLevel = calculateNextLevelExp(level);
    }

    const updatedStats = scaleStats(level);
    const updatedSkills = unlockSkills(level, element);

    return {
      ...character,
      exp,
      level,
      expToNextLevel,
      stats: updatedStats,
      skills: updatedSkills,
    };
  }, []);

  return { gainExp };
}
