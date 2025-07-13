import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useThemeContext } from "../context/ThemeContext";

export default function BattleButton({
  onPress,
  label,
  style,
  gradientColors,
  textColor,
  glowColor,
}) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Gradient aus Theme oder Prop
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
              shadowRadius: 8,
              shadowOpacity: 0.22,
              shadowOffset: { width: 0, height: 2 },
            },
            android: {
              elevation: 7,
            },
          }),
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Glass-Blur-Background */}
      <BlurView
        intensity={38}
        tint={theme.mode === "dark" ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={colors}
        start={[0, 0]}
        end={[1, 0]}
        style={[StyleSheet.absoluteFill, { opacity: 0.81 }]}
      />
      {/* Glasrand */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: 18,
            borderWidth: 1.5,
            borderColor: "#fff7", // halbtransparenter Glasrand
            opacity: 0.7,
          },
        ]}
        pointerEvents="none"
      />
      <Text
        style={[
          styles.text,
          {
            color: tColor,
            textShadowColor: gColor,
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 11,
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
      flexDirection: "row",
      flexWrap: "wrap",
      borderRadius: 18,
      width: "45%",
      justifyContent: "center",
      overflow: "hidden",
      transform: [{ skewY: "-3deg" }],
      backgroundColor: theme.mode === "dark" ? "#25252599" : "#fff8", // Fallback
      marginVertical: 6,
    },
    text: {
      fontSize: 25,
      textAlign: "center",
      paddingVertical: 10,
      fontWeight: "600",
      letterSpacing: 0.04,
    },
  });
}
