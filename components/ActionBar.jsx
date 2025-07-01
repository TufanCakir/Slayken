import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";

export default function ActionBar({ navigation, t }) {
  const { theme } = useThemeContext();
  const iconColor = theme.textColor;

  const buttons = [
    {
      icon: <Ionicons name="gift-outline" size={24} color={iconColor} />,
      screen: "GiftScreen",
      label: t("giftLabel"),
    },
    {
      icon: <Entypo name="news" size={24} color={iconColor} />,
      screen: "NewsScreen",
      label: t("newsLabel"),
    },
    {
      icon: <FontAwesome5 name="tasks" size={24} color={iconColor} />,
      screen: "MissionScreen",
      label: t("missionsLabel"),
    },
    {
      icon: <Feather name="settings" size={24} color={iconColor} />,
      screen: "SettingsScreen",
      label: t("settingsLabel"),
    },
  ];

  const styles = createStyles(theme);

  return (
    <View style={styles.row}>
      {buttons.map(({ icon, screen, label }, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate(screen)}
          activeOpacity={0.85}
        >
          <View style={styles.inner}>
            {icon}
            <Text style={styles.label}>{label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function createStyles(theme) {
  // Hole Glow- und Border-Farben aus deinem Theme (Fallbacks inklusive)
  const glow = theme.glowColor || theme.shadowColor || "#facc15";
  const borderGlow = theme.borderGlowColor || theme.borderColor || "#facc15";

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingBottom: 16,
      marginTop: 24,
      width: "100%",
    },
    button: {
      flex: 1,
      marginHorizontal: 6,
      height: 74,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: borderGlow,
      backgroundColor: theme.accentColor,
      justifyContent: "center",
      alignItems: "center",
      overflow: "visible",
      // Glow-Shadow
      shadowColor: glow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.46,
      shadowRadius: 18,
      elevation: 8,
      // leichtes „Inset“-Feeling durch dickere Border und Glow
    },
    inner: {
      alignItems: "center",
      // Hier könnte man noch einen Glow für das Icon machen (TextShadow siehe unten)
    },
    label: {
      fontSize: 14,
      marginTop: 7,
      textAlign: "center",
      color: theme.textColor,
      fontWeight: "bold",
      letterSpacing: 0.4,
      // Text Glow/Shadow
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 7,
    },
  });
}
