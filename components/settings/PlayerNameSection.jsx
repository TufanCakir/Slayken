import React, { useEffect, useState } from "react";
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

export default function PlayerNameSection() {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState("");

  useEffect(() => {
    AsyncStorage.getItem("user").then((savedUser) => {
      if (savedUser) setUsername(savedUser);
    });
  }, []);

  const handleSave = async () => {
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
  };

  const styles = createStyles(theme);

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
      />
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
      >
        {/* Gradient-Hintergrund */}
        <LinearGradient
          colors={
            theme.linearGradient || [
              theme.accentColorSecondary,
              theme.accentColor,
              theme.accentColorDark,
            ]
          }
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

const createStyles = (theme) =>
  StyleSheet.create({
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
      overflow: "hidden", // Gradient bleibt im Button!
      position: "relative", // Für absoluteFill
    },

    buttonText: {
      fontSize: 16,
      color: theme.textColor,
      letterSpacing: 0.2,
      fontWeight: "bold",
    },
  });
