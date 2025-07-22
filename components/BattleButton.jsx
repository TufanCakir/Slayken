import React, { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeContext } from "../context/ThemeContext";

function BattleButtonComponent({
  onPress,
  label,
  style,
  gradientColors,
  textColor,
  skewY = "-3deg", // Standardwert für SkewY, optional anpassbar
}) {
  const { theme } = useThemeContext();

  // Styles & Farben nur neu berechnen, wenn Theme/Props sich ändern
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Farb-Array: 1. Prop, 2. Theme.linearGradient falls vorhanden, sonst Default-Fallback
  const colors = useMemo(() => {
    if (gradientColors && gradientColors.length > 0) return gradientColors;
    if (theme.linearGradient && theme.linearGradient.length > 0)
      return theme.linearGradient;
    return [
      theme.accentColorSecondary,
      theme.accentColor,
      theme.accentColorDark,
    ];
  }, [gradientColors, theme]);

  // Textfarbe: Prop oder Theme-Farbe
  const tColor = textColor || theme.textColor;

  // Blur-Tint je nach Theme-Mode fallback auf 'light'
  const blurTint = theme.mode === "dark" ? "dark" : "light";

  return (
    <TouchableOpacity
      style={[styles.button, { transform: [{ skewY }] }, style]} // Skew transform dynamisch
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {/* Glass-Blur als Hintergrund */}
      <BlurView
        intensity={30}
        tint={blurTint}
        style={StyleSheet.absoluteFill}
      />

      {/* Farbverlauf-Overlay */}
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.81 }]}
      />

      {/* Glas-Rand */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: "#fff7",
            opacity: 0.7,
          },
        ]}
        pointerEvents="none"
      />

      {/* Button-Text */}
      <Text style={[styles.text, { color: tColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const BattleButton = React.memo(BattleButtonComponent);

export default BattleButton;

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      flexDirection: "row",
      borderRadius: 18,
      width: "45%",
      justifyContent: "center",
      overflow: "hidden",
      backgroundColor: theme.mode === "dark" ? "#25252599" : "#fff8",
      marginVertical: 6,
      // Kein shadow, kein elevation
    },
    text: {
      fontSize: 25,
      textAlign: "center",
      paddingVertical: 10,
      fontWeight: "600",
      letterSpacing: 0.04,
      // Kein textShadow
    },
  });
}
