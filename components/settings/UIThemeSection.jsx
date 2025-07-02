import { View, Text, StyleSheet } from "react-native";
import { t } from "../../i18n";
import ThemeSwitcher from "../ThemeSwitcher";
import { useThemeContext } from "../../context/ThemeContext";

export default function UIThemeSection() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t("uiThemeSection")}</Text>
      <ThemeSwitcher />
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 32,
      paddingHorizontal: 8,
      paddingVertical: 10,
      borderRadius: 14,
      backgroundColor: theme.accentColor,
    },
    title: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 10,
      color: theme.textColor,
      letterSpacing: 0.2,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
