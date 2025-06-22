import { Text, FlatList, StyleSheet } from "react-native";

import ScreenLayout from "../components/ScreenLayout";
import { useCrystals } from "../context/CrystalContext";
import { useCoins } from "../context/CoinContext";
import { useMissions } from "../context/MissionContext";
import MissionItem from "../components/MissionItem"; // ✅ Ausgelagert

export default function MissionScreen() {
  const { addCrystals } = useCrystals();
  const { addCoins } = useCoins();
  const { missions, collectReward } = useMissions();

  const handleCollect = (mission) => {
    if (mission.completed && !mission.collected) {
      if (mission.reward.type === "crystal") {
        addCrystals(mission.reward.amount);
      } else if (mission.reward.type === "coin") {
        addCoins(mission.reward.amount);
      }
      collectReward(mission.id);
    }
  };

  const renderItem = ({ item }) => (
    <MissionItem item={item} onCollect={handleCollect} />
  );

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.header}>Missionen</Text>
      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Keine Missionen verfügbar</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1.1,
    color: "#60a5fa",
    textAlign: "center",
    marginVertical: 24,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  listContainer: {
    paddingBottom: 80,
    paddingHorizontal: 16,
  },
  empty: {
    textAlign: "center",
    marginTop: 36,
    fontSize: 17,
    color: "#7dd3fc",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
});
