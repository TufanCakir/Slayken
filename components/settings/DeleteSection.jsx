import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { useClass } from "../../context/ClassContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function DeleteSection() {
  const { clearAllClasses } = useClass();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Gradient-Farben: Aus Theme oder fallback
  const colors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const confirmReset = useCallback(() => {
    Alert.alert(
      t("settingsLabels.resetConfirmTitle"),
      t("settingsLabels.resetConfirmMessage"),
      [
        { text: t("settingsLabels.cancel"), style: "cancel" },
        {
          text: t("settingsLabels.resetApp"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await clearAllClasses();
              await Updates.reloadAsync();
            } catch {
              Alert.alert(t("settingsLabels.resetError"));
            }
          },
        },
      ]
    );
  }, [clearAllClasses]);

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        onPress={confirmReset}
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
      >
        {/* LinearGradient als Button-Hintergrund */}
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.resetText}>{t("settingsLabels.resetApp")}</Text>
      </Pressable>
    </View>
  );
}

// Styles
function createStyles(theme) {
  const accent = theme.accentColor;
  const text = theme.textColor;
  return StyleSheet.create({
    section: {
      marginBottom: 36,
      alignItems: "center",
    },
    resetButton: {
      position: "relative", // Für Gradient-Layer
      overflow: "hidden", // Für runde Ecken beim Gradient!
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    resetButtonPressed: {
      opacity: 0.7,
    },
    resetText: {
      color: text,
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.12,
      zIndex: 1, // Falls nötig, um über Gradient zu liegen
    },
  });
}
