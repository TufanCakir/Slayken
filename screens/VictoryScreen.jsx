import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { resetToHome } from "../utils/navigationUtils";

// Blaues Design
const BLUE_GOLD = "#facc15";
const BLUE_CARD = "#1e293b";
const BLUE_BORDER = "#38bdf8";
const BLUE_BG = "#0f172a";
const BLUE_TEXT = "#f0f9ff";
const BLUE_GREEN = "#34d399";
const BLUE_ACCENT = "#2563eb";
const BLUE_SHADOW = "#1e40af";

export default function VictoryScreen({ route }) {
  const navigation = useNavigation();
  const {
    coinReward = 0,
    crystalReward = 0,
    character = null,
    isEvent = false,
  } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Sieg!</Text>

      {character && (
        <View style={styles.characterBox}>
          <Image
            source={{ uri: character.classUrl }}
            style={styles.avatar}
            contentFit="contain"
          />
          <View>
            <Text style={styles.name}>{character.name}</Text>
            <Text style={styles.level}>Level {character.level}</Text>
            <Text style={styles.xp}>
              XP: {character.exp} / {character.expToNextLevel}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.rewards}>
        <Text style={styles.rewardText}>💰 +{coinReward} Coins</Text>
        <Text style={styles.rewardText}>💎 +{crystalReward} Crystals</Text>
        {isEvent && (
          <Text style={styles.eventLabel}>📅 Event abgeschlossen!</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => resetToHome(navigation)}
      >
        <Text style={styles.buttonText}>Zurück zum Hauptmenü</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_BG,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: BLUE_GOLD,
    marginBottom: 34,
    letterSpacing: 0.5,
    textShadowColor: "#1e293b88",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  characterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BLUE_CARD,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BLUE_BORDER,
    padding: 14,
    marginBottom: 24,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 7,
  },
  avatar: {
    width: 80,
    height: 80,
    marginRight: 14,
    borderRadius: 14,
    backgroundColor: "#334155",
    borderWidth: 2,
    borderColor: BLUE_BORDER,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: BLUE_TEXT,
    marginBottom: 2,
  },
  level: {
    fontSize: 14,
    color: "#bae6fd",
    marginTop: 3,
  },
  xp: {
    fontSize: 13,
    color: "#60a5fa",
    marginTop: 3,
  },
  rewards: {
    marginBottom: 36,
    alignItems: "center",
  },
  rewardText: {
    fontSize: 18,
    color: BLUE_GREEN,
    marginVertical: 4,
    textAlign: "center",
    fontWeight: "600",
    textShadowColor: "#1e293b44",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  eventLabel: {
    marginTop: 8,
    fontSize: 15,
    color: BLUE_TEXT,
    fontStyle: "italic",
    fontWeight: "600",
    textShadowColor: "#0ea5e9bb",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  button: {
    backgroundColor: BLUE_ACCENT,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#38bdf8",
    marginTop: 10,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 7,
  },
  buttonText: {
    color: BLUE_TEXT,
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.4,
    textAlign: "center",
    textShadowColor: "#1e293b44",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
