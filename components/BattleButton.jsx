import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";

export default function BattleButton({ onPress, label, style }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  // Dynamische Glow-Farben
  const glow = theme.glowColor || theme.shadowColor || "#ffbb00";
  const borderGlow = theme.borderGlowColor || theme.borderColor || "#ffbb00";
  return StyleSheet.create({
    button: {
      marginTop: 12,
      borderRadius: 18,
      backgroundColor: theme.accentColor,
      borderColor: borderGlow, // Glow Border
      borderWidth: 3,
      flexDirection: "row",
      paddingBottom: 10,
      paddingTop: 6,
      height: 100,
      width: "100%",
      zIndex: 1,
      transform: [{ skewY: "-3deg" }],
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: 25,
      color: theme.textColor,
      fontWeight: "bold",
      letterSpacing: 0.7,
      textAlign: "center",
    },
  });
}
