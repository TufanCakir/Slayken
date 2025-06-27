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
          <ControlButton
            key={code}
            label={t(`languageLabels.${code}`)}
            selected={language === code}
            onPress={() => setLanguage(code)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

function ControlButton({ label, selected, onPress, theme }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={selected}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        marginRight: 8,
        marginBottom: 5,
        minWidth: 90,
        alignItems: "center",
        backgroundColor: selected ? theme.textColor : theme.accentColor,
        borderColor: theme.borderColor,
        shadowColor: selected ? theme.shadowColor : "transparent",
        shadowOpacity: selected ? 0.4 : 0,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 7,
        elevation: 4,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 15,
          fontWeight: "bold",
          letterSpacing: 0.5,
          textAlign: "center",
          color: selected ? theme.accentColor : theme.textColor,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
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
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 2,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
  });
