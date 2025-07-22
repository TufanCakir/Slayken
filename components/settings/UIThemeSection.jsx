import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { t } from "../../i18n";
import ThemeSwitcher from "../ThemeSwitcher";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

function UIThemeSectionComponent() {
  const { theme } = useThemeContext();

  // Styles & Gradients memoisiert für extra Performance
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () =>
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [theme]
  );

  return (
    <View style={styles.section}>
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

export default React.memo(UIThemeSectionComponent);

// Styles Factory
function createStyles(theme) {
  return StyleSheet.create({
    section: {
      marginBottom: 32,
      paddingHorizontal: 8,
      paddingVertical: 10,
      borderRadius: 14,
      overflow: "hidden",
      position: "relative",
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
}
