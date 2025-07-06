// Skaliert die Boss-Stats abhängig vom Spielerlevel (balancierbar)
export function scaleBossStats(boss, playerLevel = 1) {
  if (!boss) return boss;

  // Fallbacks und Basiswerte auslesen
  const baseHp = boss.baseHp ?? boss.hp ?? 100;
  const baseDefense = boss.baseDefense ?? boss.defense ?? 10;

  // Skalierung: Passe die Faktoren hier an dein gewünschtes Game-Balancing an!
  const hpScale = 1 + (playerLevel - 1) * 0.25; // +25% HP je Level über 1
  const defScale = 1 + (playerLevel - 1) * 0.15; // +15% DEF je Level über 1

  return {
    ...boss,
    hp: Math.round(baseHp * hpScale),
    defense: Math.round(baseDefense * defScale),
  };
}

// Berechnet den Schaden einer Attacke (mit ausführlichem Debug)
export function calculateSkillDamage({
  charStats = {},
  percentBonuses = {},
  skill = {},
  enemyDefense = 0,
}) {
  // Grundangriff
  const baseAttack = charStats.attack ?? charStats.strength ?? 1;

  // Prozentualer Bonus auf Angriff
  const attackBonusPercent = percentBonuses.attack ?? 0;
  let attackWithBonus = baseAttack * (1 + attackBonusPercent / 100);

  // Stärke als Multiplikator (optional für RPG-Stat-Builds)
  const strength = charStats.strength ?? 0;
  attackWithBonus *= 1 + strength * 0.01;

  // Levelbonus (leichter Progress je Level)
  const level = charStats.level ?? 1;
  if (level > 1) {
    attackWithBonus *= 1 + (level - 1) * 0.01;
  }

  // Skill-Multiplier: Specials haben mind. 0.2, basic mind. 0.5
  const skillMultiplier =
    skill.effect === "basic"
      ? Math.max((skill.power ?? 100) / 100, 0.5)
      : Math.max((skill.skillDmg ?? 100) / 100, 0.2);

  // Flacher Bonus, falls gesetzt
  const flatBonus = skill.basePower ?? 0;

  // Berechnung
  let totalDamage =
    attackWithBonus * skillMultiplier + flatBonus - enemyDefense;

  // Debug: Zeige vor dem Min-Schaden-Kappen den Wert
  const _debugUncapped = totalDamage;

  // Minimal-Schaden (hier: 1, kann auf 0 geändert werden für "Immunität")
  const minDamage = skill.effect === "basic" ? 10 : 10; // Beispiel für unterschiedlich starke Skills
  totalDamage = Math.max(minDamage, totalDamage);

  // Optional: Auch abgerundete Werte loggen (für klare Lesbarkeit)
  console.log("SkillDamage DEBUG", {
    baseAttack,
    attackWithBonus: Math.round(attackWithBonus * 100) / 100,
    skillMultiplier,
    flatBonus,
    enemyDefense,
    uncappedDamage: Math.round(_debugUncapped * 100) / 100,
    totalDamage: Math.round(totalDamage),
  });

  // Immer auf volle Zahl runden (kein Nachkommerschaden)
  return Math.round(totalDamage);
}
