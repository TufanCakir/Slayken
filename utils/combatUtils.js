export function calculateSkillDamage({
  charStats = {},
  percentBonuses = {},
  skill = {},
  enemyDefense = 0,
}) {
  // Basiswert: attack, fallback auf strength, sonst 1
  const baseAttack = charStats.attack ?? charStats.strength ?? 1;

  // Prozent-Bonus (z.B. aus Equipment), default 0
  const attackBonusPercent = percentBonuses.attack ?? 0;

  // Angriff mit Prozent-Bonus
  let attackWithBonus = baseAttack * (1 + attackBonusPercent / 100);

  // Stärke-Bonus: +1% pro Strength-Punkt
  const strength = charStats.strength ?? 0;
  attackWithBonus *= 1 + strength * 0.01;

  // Level-Bonus: +1% pro Level über 1
  const level = charStats.level ?? 1;
  if (level > 1) {
    attackWithBonus *= 1 + (level - 1) * 0.01;
  }

  // Skill-Multiplikator (z.B. 35 => 0.35), fallback = 1 (100%)
  const skillMultiplier = (skill.skillDmg ?? 100) / 100;
  let totalDamage = attackWithBonus * skillMultiplier;

  // Flat-Bonus hinzufügen
  const flatBonus = skill.basePower ?? 0;
  totalDamage += flatBonus;

  // Defense abziehen
  totalDamage -= enemyDefense;
  totalDamage = Math.max(1, totalDamage);

  // Debug
  console.log("SkillDamage DEBUG", {
    baseAttack,
    attackBonusPercent,
    attackWithBonus: Math.round(attackWithBonus),
    strength,
    level,
    skillMultiplier,
    flatBonus,
    enemyDefense,
    totalDamage: Math.round(totalDamage),
  });

  return Math.round(totalDamage);
}
