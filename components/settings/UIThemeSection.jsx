import { View, Text, StyleSheet } from "react-native";
import { t } from "../../i18n";
import ThemeSwitcher from "../ThemeSwitcher";

const textColor = "#60a5fa"; // schönes, helles Blau für Headlines

export default function UIThemeSection() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t("uiThemeSection")}</Text>
      <ThemeSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: textColor,
    letterSpacing: 0.2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
