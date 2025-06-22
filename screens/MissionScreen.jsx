import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import ScreenLayout from "../components/ScreenLayout";

export default function MissionScreen() {
  const theme = {
    accentColor: "#1e293b",
    textColor: "#60a5fa",
    shadowColor: "#2563eb",
  };

  const missions = [
    { id: "1", title: "Mission 1: Gewinne einen Kampf!", completed: false },
    { id: "2", title: "Mission 2: Verwende einen Heilzauber", completed: true },
    { id: "3", title: "Mission 3: Erreiche Level 3", completed: false },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.missionItem}>
      <Text
        style={[
          styles.missionText,
          {
            color: item.completed ? "#94a3b8" : "#38bdf8",
            backgroundColor: "#0ea5e9",
            opacity: item.completed ? 0.6 : 1,
          },
          item.completed && { textDecorationLine: "line-through" },
        ]}
      >
        {item.title}
      </Text>
    </View>
  );

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />

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

      <View style={styles.footerWrapper}></View>
    </ScreenLayout>
  );
}

const { height } = Dimensions.get("window");

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
  missionItem: {
    marginBottom: 16,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 4,
    borderRadius: 13,
    overflow: "hidden",
  },
  missionText: {
    fontSize: 17,
    letterSpacing: 0.8,
    paddingVertical: 17,
    paddingHorizontal: 18,
    backgroundColor: "#0ea5e9",
    borderRadius: 13,
    color: "#38bdf8",
    fontWeight: "600",
    shadowColor: "#1e293b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 3,
    elevation: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: 36,
    fontSize: 17,
    color: "#7dd3fc",
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
