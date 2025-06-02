// Datei: screens/MissionScreen.js
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import ScreenLayout from "../components/ScreenLayout";
import { useThemeContext } from "../context/ThemeContext";

export default function MissionScreen() {
  const { theme } = useThemeContext();

  const missions = [
    { id: "1", title: "Mission 1", completed: false },
    // Weitere Missionen …
  ];

  const renderItem = ({ item }) => (
    <View style={styles.missionItem}>
      <Text
        style={[
          styles.missionText,
          { color: theme.textColor, backgroundColor: theme.accentColor },
          item.completed && {
            textDecorationLine: "line-through",
            color: theme.shadowColor,
          },
        ]}
      >
        {item.title}
      </Text>
    </View>
  );

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />

      <Text
        style={[
          styles.header,
          { color: theme.textColor, backgroundColor: theme.accentColor },
        ]}
      >
        Missionen
      </Text>

      <FlatList
        data={missions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              { color: theme.textColor, backgroundColor: theme.accentColor },
            ]}
          >
            Keine Missionen verfügbar
          </Text>
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
  },
  header: {
    fontSize: 16,
    letterSpacing: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    zIndex: 3,
  },
  listContainer: {
    paddingBottom: 80,
    zIndex: 2,
  },
  missionItem: {
    fontSize: 16,
    letterSpacing: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    zIndex: 3,
  },
  missionText: {
    fontSize: 16,
    letterSpacing: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 3,
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    zIndex: 2,
  },
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
});
