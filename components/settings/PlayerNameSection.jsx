import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../../i18n";
import { useThemeContext } from "../../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

function PlayerNameSectionComponent() {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState("");

  // Memoisiere Styles & Gradient für beste Performance
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

  useEffect(() => {
    // Username nur beim Mount einmal laden
    AsyncStorage.getItem("user").then((savedUser) => {
      if (savedUser) setUsername(savedUser);
    });
  }, []);

  const handleSave = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert(
        t("playerNameLabels.errorTitle"),
        t("playerNameLabels.errorEmptyName")
      );
      return;
    }
    await AsyncStorage.setItem("user", trimmed);
    Alert.alert(
      t("playerNameLabels.savedTitle"),
      t("playerNameLabels.nameSaved")
    );
  }, [username]);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t("playerNameLabels.playerNameTitle")}</Text>
      <Text style={styles.label}>{t("playerNameLabels.currentNameLabel")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("playerNameLabels.newNamePlaceholder")}
        placeholderTextColor={
          theme.placeholderTextColor || theme.textColor + "77"
        }
        value={username}
        onChangeText={setUsername}
        autoCapitalize="words"
        returnKeyType="done"
        maxLength={22}
      />
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.buttonText}>
          {t("playerNameLabels.saveButton")}
        </Text>
      </Pressable>
    </View>
  );
}

export default React.memo(PlayerNameSectionComponent);

// ---- Styles als Factory (immer per useMemo einbinden!) ----
function createStyles(theme) {
  return StyleSheet.create({
    section: {
      marginBottom: 30,
      borderRadius: 12,
      padding: 18,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textColor,
      marginBottom: 8,
    },
    label: {
      color: theme.placeholderTextColor || theme.textColor + "88",
      marginBottom: 6,
      fontSize: 15,
      fontWeight: "500",
    },
    input: {
      borderWidth: 2,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      fontSize: 16,
      color: theme.textColor,
      backgroundColor: theme.accentColor,
      borderColor: theme.textColor + "44",
    },
    button: {
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 6,
      overflow: "hidden",
      position: "relative",
    },
    buttonText: {
      fontSize: 16,
      color: theme.textColor,
      letterSpacing: 0.2,
      fontWeight: "bold",
    },
  });
}
