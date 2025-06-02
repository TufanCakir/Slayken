// hooks/useBattleLogic.js

import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useChapter } from "../../context/ChapterContext";
import { useAccountLevel } from "../../context/AccountLevelContext";
import { useCoins } from "../../context/CoinContext";
import { useCrystals } from "../../context/CrystalContext";
import { calculateXpReward } from "../../utils/xpUtils";

export function useBattleLogic({ chapterType, bossName }) {
  const navigation = useNavigation();
  const { currentChapterIndex, advanceChapter } = useChapter();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();

  const [hp, setHp] = useState(100);
  const [bossDefeated, setBossDefeated] = useState(false);

  const xpReward = calculateXpReward(bossName);
  const coinReward = 100;
  const crystalReward = 5;

  const handleFight = (damage = 20) => {
    const remainingHp = hp - damage;
    if (remainingHp <= 0) {
      setHp(0);
      setBossDefeated(true);
      addCoins(coinReward);
      addCrystals(crystalReward);
      addXp(xpReward);
      advanceChapter();
      navigation.navigate("VictoryScreen", {
        bossName,
        coinReward,
        crystalReward,
        xpReward,
        chapterType,
      });
    } else {
      setHp(remainingHp);
    }
  };

  return {
    hp,
    bossDefeated,
    xpReward,
    coinReward,
    crystalReward,
    handleFight,
  };
}
