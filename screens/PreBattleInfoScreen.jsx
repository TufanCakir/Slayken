import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";

export default function PreBattleInfoScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

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
          {" "}
          <Text style={styles.highlight}>
            Im Kampf kannst du je nach Charakter-Level neue Fähigkeiten
            freischalten.
          </Text>
        </Text>
        <Text style={styles.text}>
          {" "}
          <Text style={styles.highlight}>
            Du verdienst Münzen und Kristalle, wenn du Gegner besiegst.
          </Text>
        </Text>
        <Text style={styles.text}>
          {" "}
          <Text style={styles.highlight}>
            Der Boss wird dich aktiv angreifen – achte auf deine Lebenspunkte!
          </Text>
        </Text>
        <Text style={styles.text}>
          {" "}
          <Text style={styles.highlight}>
            Standardmäßig besitzt jeder Charakter den Heilungszauber.
          </Text>
        </Text>
        <Text style={styles.text}>
          {" "}
          <Text style={styles.highlight}>
            Dieser Zauber verursacht Schaden am Boss und heilt dich gleichzeitig
            um einen Teil.
          </Text>
        </Text>
        <Text style={styles.text}>
          {" "}
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

function createStyles(theme) {
  // Theme Werte fallback (für Dark, Fire etc.)
  const accent = theme.accentColor || "#0f172a";
  const textMain = theme.textColor || "#c7dfff";
  const highlight = theme.borderGlowColor || "#38bdf8";

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      color: highlight,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.45,
      paddingBottom: 7,
      backgroundColor: accent,
      borderRadius: 15,
      alignSelf: "center",
      width: "85%",
    },
    content: {
      paddingVertical: 20,
      paddingHorizontal: 7,
      gap: 14,
    },
    text: {
      fontSize: 18,
      color: textMain,
      marginBottom: 8,
      textAlign: "center",
      lineHeight: 26,
      letterSpacing: 0.1,
      backgroundColor: accent,
      borderRadius: 9,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },
    highlight: { fontSize: 20 },
    button: {
      marginTop: 22,
      backgroundColor: accent,
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 26,
    },
    buttonText: {
      color: textMain,
      fontSize: 20,
      letterSpacing: 0.2,
    },
  });
}
