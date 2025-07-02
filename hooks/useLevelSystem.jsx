import { useCallback } from "react";
import { skillPool } from "../data/skillPool";

const LEVEL_CAP = 50;

const baseStats = {
  strength: 10,
  defense: 8,
  agility: 5,
  intelligence: 4,
};

// EXP für das nächste Level
function calculateNextLevelExp(level) {
  return 100 + level * 50;
}

// Skaliert Stats auf Level-Basis (kann optional auf Startwerte des Characters gehen)
function scaleStats(level, base = baseStats) {
  return {
    strength: (base.strength || 10) + level * 2,
    defense: (base.defense || 8) + level * 1.5,
    agility: (base.agility || 5) + level,
    intelligence: (base.intelligence || 4) + level,
  };
}

// Skills freischalten
function unlockSkills(level, element) {
  return skillPool.filter(
    (skill) =>
      level >= skill.level && (!skill.element || skill.element === element)
  );
}

// Der eigentliche Hook
export function useLevelSystem() {
  // Charakter leveln und neue Werte liefern
  const gainExp = useCallback((character, amount) => {
    let {
      exp = 0,
      expToNextLevel,
      level = 1,
      element,
      stats: prevStats = {},
    } = character;

    // Fallback, falls expToNextLevel fehlt
    expToNextLevel = expToNextLevel || calculateNextLevelExp(level);

    exp += amount;

    let leveledUp = false;

    // So lange EXP fürs nächste Level reichen und Cap nicht erreicht
    while (exp >= expToNextLevel && level < LEVEL_CAP) {
      exp -= expToNextLevel;
      level++;
      expToNextLevel = calculateNextLevelExp(level);
      leveledUp = true;
    }

    // Wenn Cap erreicht: EXP fixieren
    if (level >= LEVEL_CAP) {
      level = LEVEL_CAP;
      exp = 0;
      expToNextLevel = 0;
    }

    // Stats: Gehe immer von baseStats ODER individuellen Startwerten aus
    const updatedStats = scaleStats(level, prevStats.base || baseStats);

    // Freigeschaltete Skills (element berücksichtigen)
    const updatedSkills = unlockSkills(level, element);

    return {
      ...character,
      exp,
      level,
      expToNextLevel,
      stats: updatedStats,
      skills: updatedSkills,
      // Optionales Flag, falls man im UI "Level Up!" animieren will
      justLeveledUp: leveledUp,
    };
  }, []);

  return { gainExp };
}
