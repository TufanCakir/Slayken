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
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      marginTop: 12,
      borderRadius: 18,
      borderWidth: 2.5,
      borderColor: theme.borderColor,
      backgroundColor: theme.accentColor,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      transform: [{ skewY: "-3deg" }],
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
