import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

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

  const gradient = theme.linearGradient || [
    "#000000",
    "#000000",
    "#FF2D00",
    "#FF2D00",
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.titleGradient}
      >
        <Text style={styles.title}>Kampfinfos</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {INFO_POINTS.map((text, i) => (
          <LinearGradient
            key={i}
            colors={gradient}
            start={{ x: 0, y: 0.2 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoGradient}
          >
            <Text style={styles.infoText}>{text}</Text>
          </LinearGradient>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.buttonOuter}
        activeOpacity={0.89}
        onPress={() => navigation.replace("EndlessModeScreen")}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Weiter zum Kampf</Text>
        </LinearGradient>
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
    titleGradient: {
      marginTop: 22,
      marginBottom: 12,
      borderRadius: 15,
      width: "90%",
      alignSelf: "center",
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.13,
      shadowRadius: 12,
      elevation: 3,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    title: {
      fontSize: 28,
      color: highlight,
      textAlign: "center",
      fontWeight: "bold",
      letterSpacing: 0.35,
      backgroundColor: "transparent",
    },
    content: {
      paddingVertical: 16,
      paddingHorizontal: 18,
      gap: 14,
    },
    infoGradient: {
      borderRadius: 11,
      paddingVertical: 11,
      paddingHorizontal: 10,
      marginBottom: 8,
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
      elevation: 2,
    },
    infoText: {
      fontSize: 18,
      color: textMain,
      textAlign: "center",
      lineHeight: 26,
      letterSpacing: 0.09,
      backgroundColor: "transparent",
      fontWeight: "500",
      textShadowColor: theme.accentColorDark,
      textShadowRadius: 2,
      textShadowOffset: { width: 0, height: 1 },
    },
    buttonOuter: {
      marginTop: 16,
      marginBottom: 34,
      borderRadius: 18,
      width: "82%",
      alignSelf: "center",
      overflow: "hidden",
      shadowColor: highlight,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.14,
      shadowRadius: 12,
      elevation: 3,
    },
    button: {
      paddingVertical: 18,
      alignItems: "center",
      borderRadius: 18,
      width: "100%",
      justifyContent: "center",
    },
    buttonText: {
      color: theme.textColor,
      fontSize: 20,
      fontWeight: "bold",
      letterSpacing: 0.16,
      textShadowColor: theme.accentColorDark,
      textShadowRadius: 3,
      textShadowOffset: { width: 0, height: 1 },
    },
  });
}
