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
  return StyleSheet.create({
    button: {
      marginTop: 12,
      borderRadius: 18,
      backgroundColor: theme.accentColor, // z. B. #111111 (dark) oder #ffffff (light)
      borderColor: theme.borderColor, // z. B. #333333 oder #dddddd
      borderWidth: 2,
      shadowColor: theme.shadowColor, // z. B. #000000 oder #aaaaaa
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.13,
      shadowRadius: 16,
      elevation: 7,
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
      fontSize: 30,
      color: theme.textColor, // z. B. #ffffff oder #111111
      letterSpacing: 0.5,
      transform: [{ skewY: "3deg" }],
      textAlign: "center",
    },
  });
}
