import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import elementData from "../data/elementData.json";
import ScreenLayout from "../components/ScreenLayout";
import { useClass } from "../context/ClassContext";

const CARD_WIDTH = Dimensions.get("window").width / 2 - 24;

export default function CharacterOverviewScreen() {
  const { classList, activeClassId, setActiveClassId, deleteClass } =
    useClass();

  const renderCharacter = ({ item }) => {
    const isActive = item.id === activeClassId;
    const element = elementData[item.element] || {};

    return (
      <View style={[styles.card, {}]}>
        <Image
          source={{ uri: item.classUrl }}
          style={styles.avatar}
          contentFit="contain"
        />
        <Text style={[styles.name]}>{item.name}</Text>
        <Text style={styles.level}>Level {item.level}</Text>
        <Text style={[styles.element, { color: element.color }]}>
          {element.icon} {element.label}
        </Text>
        <Text style={styles.classText}>{item.type}</Text>

        {/* 🧠 Skills anzeigen */}
        <Text style={styles.skillTitle}>Skills:</Text>
        {item.skills.map((skill, i) => (
          <View key={i} style={styles.skillItem}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillDesc}>{skill.description}</Text>
            <Text style={styles.skillPower}>Power: {skill.power}</Text>
          </View>
        ))}

        {/* ✅ Klassen-Auswahl */}
        {!isActive ? (
          <>
            <TouchableOpacity
              style={styles.activateButton}
              onPress={() => setActiveClassId(item.id)}
            >
              <Text style={styles.activateText}>Als Klasse aktivieren</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() =>
                Alert.alert(
                  "Charakter löschen?",
                  `${item.name} wirklich dauerhaft entfernen?`,
                  [
                    { text: "Abbrechen", style: "cancel" },
                    {
                      text: "Löschen",
                      style: "destructive",
                      onPress: () => deleteClass(item.id),
                    },
                  ]
                )
              }
            >
              <Text style={styles.deleteText}>Löschen</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.activeLabel}>🎖️ Aktive Klasse</Text>
        )}
      </View>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.title}>Charakterübersicht</Text>
      <FlatList
        data={classList}
        renderItem={renderCharacter}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.4,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 14,
    margin: 6,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 40,
    marginBottom: 8,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: "#60a5fa",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  level: {
    fontSize: 15,
    color: "#c7dfff",
    marginBottom: 3,
    fontWeight: "700",
  },
  element: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.1,
    textShadowColor: "#38bdf8",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  classText: {
    fontSize: 13,
    color: "#7dd3fc",
    marginBottom: 6,
    fontWeight: "bold",
    letterSpacing: 0.12,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#38bdf8",
    marginTop: 8,
    marginBottom: 2,
    alignSelf: "flex-start",
  },
  skillItem: {
    marginBottom: 6,
    alignSelf: "flex-start",
    backgroundColor: "#0ea5e9",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: "#7dd3fc",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  skillName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 1,
  },
  skillDesc: {
    fontSize: 11,
    color: "#e0eaff",
    marginBottom: 1,
  },
  skillPower: {
    fontSize: 11,
    color: "#0c4a6e",
    fontWeight: "bold",
  },
  activateButton: {
    marginTop: 8,
    backgroundColor: "#2563eb",
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignSelf: "stretch",
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: "#60a5fa",
  },
  activateText: {
    color: "#f0f9ff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.14,
  },
  deleteButton: {
    marginTop: 6,
    backgroundColor: "#1e293b",
    borderColor: "#38bdf8",
    borderWidth: 1.2,
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 16,
    alignSelf: "stretch",
    alignItems: "center",
  },
  deleteText: {
    color: "#38bdf8",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.1,
  },
  activeLabel: {
    marginTop: 10,
    color: "#facc15",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.15,
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
    textAlign: "center",
    shadowColor: "#facc15",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
});
