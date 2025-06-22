import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../i18n";

const LANGUAGES = ["de", "en"];

// Blau-Töne für dein Style
const accentColor = "#2563eb";
const accentColorLight = "#60a5fa";
const backgroundColor = "#0f172a";
const textColor = "#f0f9ff";

export default function LanguageSection() {
  const { language, setLanguage } = useLanguage();

  return (
    <View style={styles.section}>
      <Text style={[styles.current, { color: accentColor }]}>
        {language.toUpperCase()}
      </Text>
      <View style={styles.row}>
        {LANGUAGES.map((code) => (
          <ControlButton
            key={code}
            label={t(`languageLabels.${code}`)}
            selected={language === code}
            onPress={() => setLanguage(code)}
          />
        ))}
      </View>
    </View>
  );
}

function ControlButton({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={selected}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? accentColor : backgroundColor,
          borderColor: accentColorLight,
          shadowColor: selected ? accentColorLight : "transparent",
          shadowOpacity: selected ? 0.4 : 0,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 7,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: selected ? textColor : accentColorLight },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    alignItems: "flex-start",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  current: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 1.1,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    marginRight: 8,
    marginBottom: 5,
    minWidth: 90,
    alignItems: "center",
    backgroundColor: "#0f172a",
    elevation: 4,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
