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
      backgroundColor: theme.accentColor,
      justifyContent: "center",
      alignItems: "center",
      overflow: "visible",
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
      letterSpacing: 0.4,
    },
  });
}
