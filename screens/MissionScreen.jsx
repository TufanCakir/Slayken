import { Text, FlatList, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
      {/* Header mit Gradient */}
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.05, 0]}
        end={[1, 1]}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>Missionen</Text>
      </LinearGradient>

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
    },
    headerGradient: {
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 26,
      marginBottom: 16,
      paddingVertical: 14,
      alignItems: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 14,
      shadowOpacity: 0.33,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    header: {
      fontSize: 26,
      fontWeight: "bold",
      letterSpacing: 1.0,
      color: theme.textColor,
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
      textTransform: "uppercase",
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
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
  });
}
