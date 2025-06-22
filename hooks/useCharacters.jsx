function gainExp(character, amount) {
  let newExp = character.exp + amount;
  let newLevel = character.level;
  let expToNext = character.expToNextLevel;

  while (newExp >= expToNext) {
    newExp -= expToNext;
    newLevel += 1;
    expToNext = Math.floor(expToNext * 1.2); // z. B. 20 % schwerer pro Level
  }

  return {
    ...character,
    level: newLevel,
    exp: newExp,
    expToNextLevel: expToNext,
  };
}
