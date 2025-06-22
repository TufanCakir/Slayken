import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function PreBattleInfoScreen() {
  const navigation = useNavigation();

  const handleStartBattle = () => {
    navigation.replace("EndlessModeScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kampfinfos</Text>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.text}>
          👊{" "}
          <Text style={styles.highlight}>
            Im Kampf kannst du je nach Charakter-Level neue Fähigkeiten
            freischalten.
          </Text>
        </Text>
        <Text style={styles.text}>
          💰{" "}
          <Text style={styles.highlight}>
            Du verdienst Münzen und Kristalle, wenn du Gegner besiegst.
          </Text>
        </Text>
        <Text style={styles.text}>
          ⚠️{" "}
          <Text style={styles.highlight}>
            Der Boss wird dich aktiv angreifen – achte auf deine Lebenspunkte!
          </Text>
        </Text>
        <Text style={styles.text}>
          ✨{" "}
          <Text style={styles.highlight}>
            Standardmäßig besitzt jeder Charakter den Heilungszauber.
          </Text>
        </Text>
        <Text style={styles.text}>
          🧪{" "}
          <Text style={styles.highlight}>
            Dieser Zauber verursacht Schaden am Boss und heilt dich gleichzeitig
            um einen Teil.
          </Text>
        </Text>
        <Text style={styles.text}>
          ⚔️{" "}
          <Text style={styles.highlight}>
            Nutze Skills taktisch, sammle Erfahrung, steigere dein Level und
            werde stärker!
          </Text>
        </Text>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handleStartBattle}>
        <Text style={styles.buttonText}>Weiter zum Kampf</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingTop: 34,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#60a5fa",
    marginBottom: 14,
    textAlign: "center",
    letterSpacing: 0.4,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  content: {
    paddingVertical: 18,
    paddingHorizontal: 4,
    gap: 14,
  },
  text: {
    fontSize: 17,
    color: "#c7dfff",
    marginBottom: 8,
    textAlign: "left",
    textShadowColor: "#1e293b",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    lineHeight: 25,
  },
  highlight: {
    color: "#38bdf8",
    fontWeight: "600",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    borderRadius: 17,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  buttonText: {
    color: "#f0f9ff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.19,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
