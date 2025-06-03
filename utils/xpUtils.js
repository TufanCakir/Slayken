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
    Easy: 5,
    Medium: 15,
    Hard: 20,
    Nightmare: 50,
    Hell: 100,
  };

  const bonus = difficultyBonus[difficulty] || 0;
  return baseXp + bonus;
}
