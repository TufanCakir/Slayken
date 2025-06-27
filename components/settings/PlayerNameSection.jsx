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

export default function PlayerNameSection() {
  const { theme } = useThemeContext(); // 🎨 Theme
  const [username, setUsername] = useState("");

  useEffect(() => {
    const loadUsername = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) setUsername(savedUser);
    };
    loadUsername();
  }, []);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert(
        t("playerNameLabels.errorTitle"),
        t("playerNameLabels.errorEmptyName")
      );
      return;
    }
    await AsyncStorage.setItem("user", username.trim());
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
        placeholderTextColor="#93c5fd"
        value={username}
        onChangeText={setUsername}
      />
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]}
      >
        <Text style={styles.buttonText}>
          {t("playerNameLabels.saveButton")}
        </Text>
      </Pressable>
    </View>
  );
}

// Dynamische Styles mit Theme
const createStyles = (theme) =>
  StyleSheet.create({
    section: {
      marginBottom: 30,
      backgroundColor: theme.accentColor,
      borderRadius: 12,
      padding: 18,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09,
      shadowRadius: 10,
      elevation: 5,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.textColor,
      marginBottom: 8,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    label: {
      color: "#93c5fd",
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
      backgroundColor: "#1e293b",
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    button: {
      padding: 14,
      borderRadius: 10,
      backgroundColor: theme.textColor,
      borderWidth: 2,
      borderColor: theme.borderColor,
      alignItems: "center",
      marginTop: 6,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.13,
      shadowRadius: 5,
      elevation: 3,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.accentColor,
      letterSpacing: 0.2,
    },
  });
