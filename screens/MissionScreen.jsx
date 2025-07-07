import { Text, FlatList, StyleSheet } from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import { useCrystals } from "../context/CrystalContext";
import { useCoins } from "../context/CoinContext";
import { useMissions } from "../context/MissionContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import MissionItem from "../components/MissionItem";

export default function MissionScreen() {
  const { addCrystals } = useCrystals();
  const { addCoins } = useCoins();
  const { missions, collectReward } = useMissions();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  const styles = createStyles(theme);

  // Belohnungs-Logik als Utility
  const handleCollect = (mission) => {
    if (!mission.completed || mission.collected) return;

    switch (mission.reward.type) {
      case "crystal":
        addCrystals(mission.reward.amount);
        break;
      case "coin":
        addCoins(mission.reward.amount);
        break;
      // Optional: falls neue Typen hinzukommen
      default:
        break;
    }
    collectReward(mission.id);
  };

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.header}>Missionen</Text>
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MissionItem
            item={item}
            onCollect={handleCollect}
            imageMap={imageMap}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Keine Missionen verfügbar</Text>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.accentColor,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      letterSpacing: 0.9,
      color: theme.textColor,
      textAlign: "center",
      marginTop: 26,
      marginBottom: 16,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    listContainer: {
      paddingBottom: 80,
      paddingHorizontal: 14,
      gap: 10,
    },
    empty: {
      textAlign: "center",
      marginTop: 44,
      fontSize: 17,
      color: theme.textColor,
      fontStyle: "italic",
      opacity: 0.7,
      letterSpacing: 0.3,
    },
  });
}
