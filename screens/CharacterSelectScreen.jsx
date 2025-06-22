import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

import elementData from "../data/elementData.json";
import { useClass } from "../context/ClassContext";

export default function CharacterSelectScreen() {
  const navigation = useNavigation();
  const { classList, activeClassId, setActiveClassId } = useClass();
  const [selectedId, setSelectedId] = useState(activeClassId);

  const handleStart = () => {
    const selectedCharacter = classList.find((c) => c.id === selectedId);
    if (selectedCharacter) {
      setActiveClassId(selectedId); // ✅ aktive Klasse setzen und speichern
      navigation.navigate("TutorialStartScreen"); // oder z. B. BattleScreen
    }
  };

  const maxSlots = 15;
  const fullCharacterList = [
    ...classList,
    ...Array(Math.max(maxSlots - classList.length, 0)).fill(null),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wähle deinen Kämpfer</Text>

      <FlatList
        data={fullCharacterList}
        keyExtractor={(_, index) => index.toString()}
        numColumns={1}
        contentContainerStyle={styles.list}
        renderItem={({ item }) =>
          item ? (
            <TouchableOpacity
              key={item.id}
              style={[styles.card]}
              onPress={() => setSelectedId(item.id)}
            >
              <Image
                source={{ uri: item.classUrl }}
                style={styles.avatar}
                contentFit="contain"
              />
              <Text style={[styles.name, {}]}>{item.name}</Text>
              <Text style={styles.level}>Level {item.level}</Text>
              <Text style={[styles.element, {}]}>
                {elementData[item.element]?.icon}{" "}
                {elementData[item.element]?.label}
              </Text>
              <Text style={styles.classText}>{item.type}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.emptySlot}
              onPress={() => navigation.navigate("CreateCharacterScreen")}
            >
              <Text style={styles.emptyText}>+ Charakter erstellen</Text>
            </TouchableOpacity>
          )
        }
      />

      {selectedId && (
        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startText}>Starten</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 22,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.4,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  list: {
    paddingBottom: 28,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 17,
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: "#60a5fa",
  },
  name: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: 0.17,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  level: {
    fontSize: 15,
    color: "#c7dfff",
    fontWeight: "700",
    marginBottom: 2,
  },
  element: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7dd3fc",
    marginBottom: 4,
    letterSpacing: 0.1,
    textShadowColor: "#38bdf8",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  classText: {
    fontSize: 13,
    color: "#e0eaff",
    marginBottom: 2,
    fontWeight: "bold",
    letterSpacing: 0.12,
  },
  emptySlot: {
    backgroundColor: "#0ea5e9",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#38bdf8",
    paddingVertical: 34,
    paddingHorizontal: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#7dd3fc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    color: "#f0f9ff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.16,
  },
  startButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingVertical: 18,
    marginTop: 10,
    marginBottom: 8,
    alignSelf: "center",
    width: "80%",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  startText: {
    color: "#f0f9ff",
    fontSize: 21,
    fontWeight: "bold",
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
