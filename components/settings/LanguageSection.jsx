import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

const LANGUAGES = ["de", "en"];

function LanguageSectionComponent() {
  const { theme } = useThemeContext();
  const { language, setLanguage } = useLanguage();

  // Styles und Farben nur neu berechnen, wenn sich Theme ändert
  const styles = useMemo(() => createStyles(theme), [theme]);
  const gradientColors = useMemo(
    () =>
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [theme]
  );

  return (
    <View style={styles.section}>
      <Text style={styles.current}>{language.toUpperCase()}</Text>
      <View style={styles.row}>
        {LANGUAGES.map((code) => {
          const isActive = language === code;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              disabled={isActive}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.langButton,
                isActive && styles.langButtonActive,
                pressed && !isActive && styles.langButtonPressed,
              ]}
            >
              {/* Gradient nur für aktiven Button */}
              {isActive && (
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text
                style={[
                  styles.langButtonText,
                  isActive && styles.langButtonTextActive,
                ]}
              >
                {t(`languageLabels.${code}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// React.memo verhindert Re-Renders bei gleichem Theme/Language!
const LanguageSection = React.memo(LanguageSectionComponent);
export default LanguageSection;

// Styles werden in useMemo erstellt
function createStyles(theme) {
  const accent = theme.accentColor;
  const text = theme.textColor;
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
      color: text,
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
      backgroundColor: accent,
      marginRight: 8,
      marginBottom: 5,
      opacity: 1,
      position: "relative",
      overflow: "hidden",
    },
    langButtonActive: {
      // Der Gradient ist der Hintergrund
    },
    langButtonPressed: {
      opacity: 0.7,
    },
    langButtonText: {
      fontSize: 15,
      fontWeight: "bold",
      letterSpacing: 0.5,
      textAlign: "center",
      color: text,
      zIndex: 1,
    },
    langButtonTextActive: {
      color: accent, // Optional: Text hebt sich von Gradient ab
    },
  });
}
