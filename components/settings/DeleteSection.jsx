import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import { useLanguage } from "../../context/LanguageContext";
import { useClass } from "../../context/ClassContext";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";

export default function DeleteSection() {
  const { language } = useLanguage();
  const { clearAllClasses } = useClass();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const confirmReset = useCallback(() => {
    Alert.alert(
      t("settingsLabels.resetConfirmTitle"),
      t("settingsLabels.resetConfirmMessage"),
      [
        {
          text: t("settingsLabels.cancel"),
          style: "cancel",
        },
        {
          text: t("settingsLabels.resetApp"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await clearAllClasses();
              await Updates.reloadAsync();
            } catch (e) {
              console.error(e);
              Alert.alert(t("settingsLabels.resetError"));
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [language]);

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
        <Text style={styles.resetText}>{t("settingsLabels.resetApp")}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 36,
      alignItems: "center",
    },
    resetButton: {
      backgroundColor: theme.accentColor,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 36,
      alignItems: "center",
    },
    resetButtonPressed: {
      backgroundColor: theme.accentColor,
      shadowColor: theme.textColor,
      opacity: 0.8,
    },
    resetText: {
      color: theme.textColor,
      fontSize: 17,
      fontWeight: "bold",
      letterSpacing: 0.12,
    },
  });
