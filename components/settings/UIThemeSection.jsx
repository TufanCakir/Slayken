import { View, Text, StyleSheet } from "react-native";
import { t } from "../../i18n";
import ThemeSwitcher from "../ThemeSwitcher";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function UIThemeSection() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  return (
    <View style={styles.section}>
      {/* Gradient-Hintergrund */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={styles.title}>{t("uiThemeSection")}</Text>
      <ThemeSwitcher />
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 32,
      paddingHorizontal: 8,
      paddingVertical: 10,
      borderRadius: 14,
      overflow: "hidden", // Gradient bleibt im Container!
      position: "relative", // Für absoluteFill
      // backgroundColor: theme.accentColor,   <-- wird NICHT mehr gebraucht
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 10,
      color: theme.textColor,
      letterSpacing: 0.2,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 1,
    },
  });
