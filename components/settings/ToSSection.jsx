import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function ToSSection() {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate("ToSScreen")}
        style={({ pressed }) => [
          styles.linkButton,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.linkText}>{t("termsOfService")}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 30,
      alignItems: "center",
    },
    linkButton: {
      paddingVertical: 14,
      paddingHorizontal: 38,
      borderRadius: 11,
      alignItems: "center",
      marginTop: 48,
      borderWidth: 2,
      borderColor: theme.textColor + "33",
      overflow: "hidden", // Wichtig für den Gradient!
      position: "relative", // Wichtig für den Gradient!
    },
    linkText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textColor,
      letterSpacing: 0.2,
      zIndex: 1,
    },
  });
