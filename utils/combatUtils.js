export function calculateSkillDamage({
  charStats = {},
  percentBonuses = {},
  skill = {},
  enemyDefense = 0,
}) {
  // Basis: attack ODER strength
  const baseAttack = charStats.attack || charStats.strength || 1;
  const attackWithBonus = baseAttack * (1 + (percentBonuses.attack || 0));

  // Stärke: +1% pro Punkt (optional)
  const strength = charStats.strength || 0;
  const strengthBonus = attackWithBonus * (strength * 0.01);

  // Level: +1% pro Level über 1 (optional)
  const level = charStats.level || 1;
  const levelBonus = attackWithBonus * ((level - 1) * 0.01);

  // Multiplikator (z. B. 35 = 0.35)
  const skillMultiplier = (skill.skillDmg || 100) / 100;

  let totalDamage =
    (attackWithBonus + strengthBonus + levelBonus) * skillMultiplier;

  // Flat-SkillPower
  if (skill.basePower) totalDamage += skill.basePower;

  // Enemy Defense
  if (enemyDefense) {
    totalDamage -= enemyDefense;
    totalDamage = Math.max(1, totalDamage);
  }

  // Debugging
  console.log("SkillDamage-DEBUG", {
    charStats,
    percentBonuses,
    skill,
    baseAttack,
    attackWithBonus,
    strengthBonus,
    levelBonus,
    skillMultiplier,
    totalDamage,
    enemyDefense,
  });

  return Math.round(totalDamage);
}
