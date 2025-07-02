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

const INFO_POINTS = [
  "Im Kampf kannst du je nach Charakter-Level neue Fähigkeiten freischalten.",
  "Du verdienst Münzen und Kristalle, wenn du Gegner besiegst.",
  "Der Boss wird dich aktiv angreifen – achte auf deine Lebenspunkte!",
  "Standardmäßig besitzt jeder Charakter den Heilungszauber.",
  "Dieser Zauber verursacht Schaden am Boss und heilt dich gleichzeitig um einen Teil.",
  "Nutze Skills taktisch, sammle Erfahrung, steigere dein Level und werde stärker!",
];

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
        {INFO_POINTS.map((text, i) => (
          <Text key={i} style={styles.infoText}>
            {text}
          </Text>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={handleStartBattle}>
        <Text style={styles.buttonText}>Weiter zum Kampf</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  const accent = theme.accentColor || "#0f172a";
  const textMain = theme.textColor || "#c7dfff";
  const highlight = theme.borderGlowColor || "#38bdf8";

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
    },
    title: {
      fontSize: 28,
      color: highlight,
      marginTop: 22,
      marginBottom: 12,
      textAlign: "center",
      fontWeight: "bold",
      letterSpacing: 0.35,
      paddingVertical: 8,
      borderRadius: 15,
      width: "90%",
      alignSelf: "center",
      backgroundColor: accent,
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.13,
      shadowRadius: 12,
      elevation: 3,
    },
    content: {
      paddingVertical: 16,
      paddingHorizontal: 18,
      gap: 14,
    },
    infoText: {
      fontSize: 18,
      color: textMain,
      textAlign: "center",
      lineHeight: 26,
      letterSpacing: 0.09,
      backgroundColor: accent,
      borderRadius: 11,
      paddingVertical: 11,
      paddingHorizontal: 10,
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
      elevation: 2,
    },
    button: {
      marginTop: 16,
      backgroundColor: highlight,
      borderRadius: 18,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 34,
      width: "82%",
      alignSelf: "center",
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 3,
    },
    buttonText: {
      color: accent,
      fontSize: 20,
      fontWeight: "bold",
      letterSpacing: 0.16,
    },
  });
}
