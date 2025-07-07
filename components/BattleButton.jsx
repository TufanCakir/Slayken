import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";

export default function BattleButton({ onPress, label, style }) {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  // Hintergrundbild optional aus imageMap
  const buttonBg = imageMap["button_bg"];

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {!!buttonBg && (
        <Image
          source={buttonBg}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
      )}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      marginTop: 12,
      borderRadius: 18,
      backgroundColor: theme.accentColor,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      transform: [{ skewY: "-3deg" }],
      minHeight: 54,
    },
    text: {
      fontSize: 25,
      color: theme.textColor,
      fontWeight: "bold",
      letterSpacing: 0.7,
      textAlign: "center",
      zIndex: 2,
      // TextShadow optional fürs Feeling:
      textShadowColor: theme.shadowColor + "70",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
  });
}
