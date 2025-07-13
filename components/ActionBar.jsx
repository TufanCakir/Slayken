import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons, Feather, FontAwesome5, Entypo } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function ActionBar({ navigation, t, gradientColors }) {
  const { theme } = useThemeContext();
  const iconColor = theme.textColor;

  const buttons = [
    {
      Icon: Ionicons,
      iconProps: { name: "gift-outline", size: 24, color: iconColor },
      screen: "GiftScreen",
      label: t("giftLabel"),
    },
    {
      Icon: Entypo,
      iconProps: { name: "news", size: 24, color: iconColor },
      screen: "NewsScreen",
      label: t("newsLabel"),
    },
    {
      Icon: FontAwesome5,
      iconProps: { name: "tasks", size: 24, color: iconColor },
      screen: "MissionScreen",
      label: t("missionsLabel"),
    },
    {
      Icon: Feather,
      iconProps: { name: "settings", size: 24, color: iconColor },
      screen: "SettingsScreen",
      label: t("settingsLabel"),
    },
  ];

  const styles = createStyles(theme);

  // Gradientfarben: Von Prop oder aus Theme
  const colors = gradientColors ||
    theme.linearGradient || [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];

  return (
    <View style={styles.row}>
      {/* BlurView für Glass-Effekt */}
      <BlurView
        intensity={28}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />

      {/* Gradient als Overlay */}
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={[StyleSheet.absoluteFill, { opacity: 0.78 }]}
      />
      {buttons.map(({ Icon, iconProps, screen, label }) => (
        <TouchableOpacity
          key={screen}
          style={styles.button}
          onPress={() => navigation.navigate(screen)}
          activeOpacity={0.88}
        >
          <View style={styles.inner}>
            <Icon {...iconProps} />
            <Text style={styles.label}>{label}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingBottom: 16,
      marginTop: 24,
      width: "100%",
      position: "relative", // Wichtig für absoluteFill!
      overflow: "hidden",
      minHeight: 74,
      bottom: 15,
      borderRadius: 26, // mehr Curve!
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor + "55",
      // Schatten für Glass-Look
      shadowColor: theme.glowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.19,
      shadowRadius: 13,
      elevation: 5,
      backgroundColor: theme.accentColor + "33", // leichte Transparenz für fallback
    },
    button: {
      flex: 1,
      marginHorizontal: 6,
      height: 74,
      borderRadius: 17,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.7,
      borderColor: theme.borderGlowColor + "36",
      backgroundColor: theme.accentColor + "1A", // Glasiger Button
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
      elevation: 2,
      top: 7,
    },
    inner: {
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontSize: 12,
      marginTop: 7,
      textAlign: "center",
      color: theme.textColor,
      letterSpacing: 0.4,
      fontWeight: "600",
      textShadowColor: theme.shadowColor + "88",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
}
