import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";

const LANGUAGES = ["de", "en"];

export default function LanguageSection() {
  const { theme } = useThemeContext();
  const { language, setLanguage } = useLanguage();
  const styles = createStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.current}>{language.toUpperCase()}</Text>
      <View style={styles.row}>
        {LANGUAGES.map((code) => (
          <Pressable
            key={code}
            onPress={() => setLanguage(code)}
            disabled={language === code}
            accessibilityRole="button"
            accessibilityState={{ selected: language === code }}
            style={({ pressed }) => [
              styles.langButton,
              language === code && styles.langButtonActive,
              pressed && styles.langButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.langButtonText,
                language === code && styles.langButtonTextActive,
              ]}
            >
              {t(`languageLabels.${code}`)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    section: {
      marginTop: 20,
      alignItems: "flex-start",
      borderRadius: 10,
      padding: 12,
      marginBottom: 18,
    },
    current: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
      letterSpacing: 1.1,
      color: theme.textColor,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    langButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 90,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      marginRight: 8,
      marginBottom: 5,
      opacity: 1,
    },
    langButtonActive: {
      backgroundColor: theme.textColor,
    },
    langButtonPressed: {
      opacity: 0.7,
    },
    langButtonText: {
      fontSize: 15,
      fontWeight: "bold",
      letterSpacing: 0.5,
      textAlign: "center",
      color: theme.textColor,
    },
    langButtonTextActive: {
      color: theme.accentColor,
    },
  });
}
