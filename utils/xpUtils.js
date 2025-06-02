// utils/xpUtils.js

const bossXpMap = {
  Azroth: 50,
  Drakaroth: 70,
  Elarmarok: 100,
  // ... weitere Bosse hinzufügen
};

export function calculateXpReward(bossName, difficulty) {
  const baseXp = bossXpMap[bossName] || 50;

  const difficultyBonus = {
    Easy: 0,
    Medium: 25,
    Hard: 50,
    Nightmare: 100,
    Hell: 150,
  };

  const bonus = difficultyBonus[difficulty] || 0;
  return baseXp + bonus;
}
