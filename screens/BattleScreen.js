import { useState } from "react";
import { View, Dimensions, Text, StyleSheet } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { TabView, TabBar } from "react-native-tab-view";
import BattleScene from "../components/BattleScene";
import { difficultyLevels, chapterMap } from "../constants/battleConstants";
import { useThemeContext } from "../context/ThemeContext";
import { useChapter } from "../context/ChapterContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { calculateXpReward } from "../utils/xpUtils";
import { useTeam } from "../context/TeamContext";

const { width } = Dimensions.get("window");

// Konstante Belohnungen
const COIN_REWARD = 50;
const CRYSTAL_REWARD = 15;

export default function BattleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bossName = "Azroth", chapterType = "boss" } = route.params || {};

  const { theme } = useThemeContext();
  const { advanceChapter } = useChapter();
  const { addXp } = useAccountLevel();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { activeMemberId, addXpToMember } = useTeam();

  const [hp, setHp] = useState(100);
  const [bossDefeated, setBossDefeated] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Hole Boss-Daten basierend auf Kapiteltyp
  const chapters = chapterMap[chapterType] || [];
  const boss = chapters.find((b) => b.bossName === bossName);

  const { key: difficultyKey, label: difficultyLabel } =
    difficultyLevels[tabIndex];

  const xpReward = calculateXpReward(bossName, difficultyKey);

  if (!boss) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.bgColor }]}>
        <Text style={[styles.errorText, { color: theme.textColor }]}>
          ❌ Boss „{bossName}“ wurde nicht gefunden.{"\n"}Kapiteltyp:{" "}
          {chapterType}
        </Text>
      </View>
    );
  }

  // Angriff-Handler
  const handleFight = () => {
    const remainingHp = hp - 15;
    if (remainingHp <= 0) {
      handleVictory();
    } else {
      setHp(remainingHp);
    }
  };

  // Sieg-Handler
  const handleVictory = () => {
    console.log("🏹 Aktiver Kämpfer:", activeMemberId);

    setHp(0);
    setBossDefeated(true);

    addCoins(COIN_REWARD);
    addCrystals(CRYSTAL_REWARD);
    addXp(xpReward);

    if (activeMemberId) {
      addXpToMember(activeMemberId, xpReward);
    }

    advanceChapter();

    navigation.navigate("VictoryScreen", {
      bossName,
      coinReward: COIN_REWARD,
      crystalReward: CRYSTAL_REWARD,
      xpReward,
      chapterType,
      characterId: activeMemberId,
    });
  };

  // Render
  return (
    <TabView
      navigationState={{
        index: tabIndex,
        routes: difficultyLevels.map((d) => ({ key: d.key, title: d.label })),
      }}
      renderScene={() => (
        <BattleScene
          bossName={boss.bossName}
          bossImage={boss.image}
          difficultyLabel={difficultyLabel}
          hp={hp}
          bossDefeated={bossDefeated}
          handleFight={handleFight}
        />
      )}
      onIndexChange={setTabIndex}
      initialLayout={{ width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          style={{ backgroundColor: theme.accentColor }}
          indicatorStyle={{ backgroundColor: theme.textColor }}
          labelStyle={{ color: theme.textColor, fontWeight: "bold" }}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
