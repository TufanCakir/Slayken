import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { t } from "../i18n";
import { useThemeContext } from "../context/ThemeContext";

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState("");
  const navigation = useNavigation();

  // Bei Mount: Ist schon eingeloggt? Dann skip!
  useEffect(() => {
    AsyncStorage.getItem("user").then((savedUser) => {
      if (savedUser) navigation.replace("HomeScreen");
    });
  }, []);

  const handleLogin = () => {
    const trimmed = username.trim();
    if (!trimmed) {
      Alert.alert(
        t("playerNameLabels.errorTitle"),
        t("playerNameLabels.errorEmptyName")
      );
      return;
    }
    Alert.alert(t("confirmTitle"), t("confirmLogin", { name: trimmed }), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("yes"),
        onPress: async () => {
          try {
            await AsyncStorage.setItem("user", trimmed);
            navigation.replace("CreateCharacterScreen");
          } catch {
            Alert.alert(t("errorTitle"), t("loginFailed"));
          }
        },
      },
    ]);
  };

  const styles = createStyles(theme);
  const isDisabled = !username.trim();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("loginTitle")}</Text>
      <TextInput
        placeholder={t("playerNameLabels.newNamePlaceholder")}
        placeholderTextColor={
          theme.placeholderTextColor || theme.textColor + "77"
        }
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
      />
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {t("playerNameLabels.saveButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- Styles ----------
function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 28,
    },
    title: {
      fontSize: 26,
      color: theme.textColor,
      textAlign: "center",
      marginBottom: 30,
      letterSpacing: 0.3,
    },
    input: {
      width: "100%",
      backgroundColor: theme.inputBackground || theme.shadowColor,
      borderRadius: 14,
      fontSize: 18,
      color: theme.textColor,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginBottom: 24,
    },
    button: {
      backgroundColor: theme.accentColor,
      borderRadius: 14,
      paddingVertical: 15,
      width: "100%",
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.48,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.15,
    },
  });
}
