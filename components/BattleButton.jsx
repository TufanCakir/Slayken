import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";

export default function BattleButton({ onPress, label, style }) {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  // Beispiel: Button-Hintergrundbild (du kannst später in imageMap["button_bg"] legen)
  const buttonBg = imageMap["button_bg"];

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {buttonBg && (
        <Image
          source={buttonBg}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
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
      borderWidth: 2.5,
      borderColor: theme.borderColor,
      backgroundColor: theme.accentColor,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden", // wichtig für Hintergrundbilder
      transform: [{ skewY: "-3deg" }],
    },
    text: {
      fontSize: 25,
      color: theme.textColor,
      fontWeight: "bold",
      letterSpacing: 0.7,
      textAlign: "center",
      zIndex: 2,
    },
  });
}
