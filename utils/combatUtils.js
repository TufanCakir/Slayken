/**
 * Skaliert die Boss-Stats abhängig vom Spielerlevel.
 * Passe die Faktoren für dein Balancing an.
 */
export function scaleBossStats(boss, playerLevel = 1) {
  if (!boss) return boss;
  // Basiswerte, jeweils fallback-sicher
  const baseHp = boss.baseHp ?? boss.hp ?? 100;
  const baseDefense = boss.baseDefense ?? boss.defense ?? 10;

  // Skalierungsfaktoren
  const hpScale = 1 + 0.25 * Math.max(0, playerLevel - 1); // +25% HP je Level über 1
  const defScale = 1 + 0.15 * Math.max(0, playerLevel - 1); // +15% DEF je Level über 1

  return {
    ...boss,
    hp: Math.round(baseHp * hpScale),
    defense: Math.round(baseDefense * defScale),
  };
}

/**
 * Berechnet den Schaden einer Attacke.
 * Optional: debug=true für Konsolenausgabe.
 */
export function calculateSkillDamage({
  charStats = {},
  percentBonuses = {},
  skill = {},
  enemyDefense = 0,
  debug = false,
  minDamage = 10, // Mindestschaden (anpassbar)
}) {
  // Grundangriff
  const baseAttack = charStats.attack ?? charStats.strength ?? 1;
  // Prozentuale Boni
  const attackBonusPercent = percentBonuses.attack ?? 0;
  let attackWithBonus = baseAttack * (1 + attackBonusPercent / 100);

  // Stärke-Multiplikator
  const strength = charStats.strength ?? 0;
  attackWithBonus *= 1 + strength * 0.01;

  // Level-Bonus
  const level = charStats.level ?? 1;
  attackWithBonus *= 1 + 0.01 * Math.max(0, level - 1);

  // Skill-Multiplikator (power für basics, skillDmg für specials; Fallback auf 1)
  const skillValue =
    typeof skill.power === "number"
      ? skill.power
      : typeof skill.skillDmg === "number"
      ? skill.skillDmg
      : 100;
  const skillMultiplier =
    skill.effect === "basic"
      ? Math.max(skillValue / 100, 0.5)
      : Math.max(skillValue / 100, 0.2);

  // Flacher Bonus
  const flatBonus = skill.basePower ?? 0;

  // Schaden berechnen
  let totalDamage =
    attackWithBonus * skillMultiplier + flatBonus - enemyDefense;
  const uncapped = totalDamage;

  // Mindestschaden sicherstellen
  totalDamage = Math.max(minDamage, totalDamage);

  // Debug-Ausgabe (optional)
  if (debug) {
    console.log("SkillDamage DEBUG", {
      baseAttack,
      attackWithBonus: Math.round(attackWithBonus * 100) / 100,
      skillMultiplier,
      flatBonus,
      enemyDefense,
      uncappedDamage: Math.round(uncapped * 100) / 100,
      totalDamage: Math.round(totalDamage),
    });
  }

  // Immer ganze Zahlen
  return Math.round(totalDamage);
}
