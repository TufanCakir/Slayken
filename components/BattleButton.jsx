import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";

export default function BattleButton({
  onPress,
  label,
  style,
  gradientColors, // Neu: Übergebbare Farbpalette für LinearGradient
  textColor, // Optional: Textfarbe überschreiben
  glowColor, // Optional: Glowfarbe überschreiben
}) {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  // Hintergrundbild optional aus imageMap
  const buttonBg = imageMap["button_bg"];

  // Default-Gradient: Feuerfarben aus dem Theme
  const colors = gradientColors || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const tColor = textColor || theme.textColor;
  const gColor = glowColor || theme.glowColor;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          ...Platform.select({
            ios: {
              shadowColor: gColor,
              shadowRadius: 7,
              shadowOpacity: 0.7,
              shadowOffset: { width: 0, height: 2 },
            },
            android: {
              elevation: 6,
            },
          }),
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={StyleSheet.absoluteFill}
      />
      {!!buttonBg && (
        <Image
          source={buttonBg}
          style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} // leicht transparent, damit das Gradient dominiert
          contentFit="cover"
          transition={400}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: tColor,
            textShadowColor: gColor,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      borderRadius: 18,
      width: "100%",
      justifyContent: "center",
      overflow: "hidden",
      transform: [{ skewY: "-3deg" }],
      minHeight: 54,
      borderWidth: 2,
      borderColor: theme.borderColor,
      // Optional Glow-Rand (nur visuell für Android schwächer):
      ...(Platform.OS === "android"
        ? { borderColor: theme.borderGlowColor }
        : {}),
    },
    text: {
      fontSize: 25,
      fontWeight: "bold",
      letterSpacing: 0.7,
      textAlign: "center",
      zIndex: 2,
    },
  });
}
