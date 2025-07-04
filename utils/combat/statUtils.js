import { equipmentPool } from "../../data/equipmentPool";

// Beispiel: Berechnung von "attack" aus "strength" (und evtl. weiteren Stats)
export function getCharacterStatsWithEquipment(character) {
  let stats = { ...character.stats };
  const percentBonuses = {};

  // Equipment-Boni hinzufügen
  for (const slot in character.equipment) {
    const itemId = character.equipment[slot];
    const item = equipmentPool.find((e) => e.id === itemId);
    if (!item) continue;

    item.bonuses.forEach((bonus) => {
      if (bonus.type === "flat") {
        stats[bonus.stat] = (stats[bonus.stat] ?? 0) + bonus.value;
      } else if (bonus.type === "percent") {
        percentBonuses[bonus.stat] =
          (percentBonuses[bonus.stat] ?? 0) + bonus.value;
      }
    });
  }

  // Prozentboni anwenden
  for (const stat in percentBonuses) {
    stats[stat] = (stats[stat] ?? 0) * (1 + percentBonuses[stat] / 100);
  }

  // **Hier Attack berechnen – zum Beispiel aus Stärke (und anderen Stats, falls du willst):**
  stats.attack = Math.round((stats.strength ?? 0) * 2); // Beispiel: 1 Stärke = 2 Attack

  return { stats, percentBonuses };
}
