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
  const glow = theme.glowColor || "#38bdf8cc";
  const border = theme.borderColor || "#38bdf8";
  const textMain = theme.textColor || "#c7dfff";
  const highlight = theme.borderGlowColor || "#38bdf8";
  const shadow = theme.shadowColor || "#1e40af";

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: highlight,
      marginBottom: 18,
      textAlign: "center",
      letterSpacing: 0.45,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 10,
      borderBottomWidth: 2,
      borderColor: border,
      paddingBottom: 7,
      backgroundColor: accent + "dd",
      borderRadius: 15,
      alignSelf: "center",
      width: "85%",
      shadowColor: shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.19,
      shadowRadius: 9,
      elevation: 5,
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
      fontWeight: "500",
      backgroundColor: accent + "cc",
      borderRadius: 9,
      paddingVertical: 7,
      paddingHorizontal: 10,
    },
    highlight: {
      color: highlight,
      fontWeight: "bold",
    },
    button: {
      marginTop: 22,
      backgroundColor: highlight,
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: "center",
      shadowColor: glow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.18,
      shadowRadius: 14,
      elevation: 9,
      borderWidth: 2.5,
      borderColor: border,
      marginBottom: 26,
    },
    buttonText: {
      color: accent,
      fontWeight: "bold",
      fontSize: 20,
      letterSpacing: 0.2,
    },
  });
}
