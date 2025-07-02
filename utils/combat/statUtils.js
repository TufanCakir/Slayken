import { equipmentPool } from "../../data/equipmentPool";

export function getCharacterStatsWithEquipment(character) {
  let stats = { ...(character.stats || {}) };
  let percentBonuses = { attack: 0, expGain: 0 };

  if (character.equipment) {
    Object.values(character.equipment).forEach((equipId) => {
      const item = equipmentPool.find((eq) => eq.id === equipId);
      if (item) {
        item.bonuses.forEach((bonus) => {
          if (bonus.type === "flat")
            stats[bonus.stat] = (stats[bonus.stat] || 0) + bonus.value;
          if (bonus.type === "percent")
            percentBonuses[bonus.stat] =
              (percentBonuses[bonus.stat] || 0) + bonus.value;
        });
      }
    });
  }

  stats.level = character.level ?? 1;

  return { stats, percentBonuses };
}
