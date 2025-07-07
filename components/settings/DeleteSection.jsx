import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { useClass } from "../../context/ClassContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";

export default function DeleteSection() {
  const { clearAllClasses } = useClass();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Alert-Handler – kompakt und klar
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
        style={({ pressed }) => ({
          ...styles.resetButton,
          ...(pressed && styles.resetButtonPressed),
        })}
      >
        <Text style={styles.resetText}>{t("settingsLabels.resetApp")}</Text>
      </Pressable>
    </View>
  );
}

// Styles ohne Copy-Paste, alles zentral
function createStyles(theme) {
  const accent = theme.accentColor;
  const text = theme.textColor;
  return StyleSheet.create({
    section: {
      marginBottom: 36,
      alignItems: "center",
    },
    resetButton: {
      backgroundColor: accent,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 36,
      alignItems: "center",
      opacity: 1,
    },
    resetButtonPressed: {
      opacity: 0.7,
    },
    resetText: {
      color: text,
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.12,
    },
  });
}
