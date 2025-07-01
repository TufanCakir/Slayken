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

  useEffect(() => {
    const checkLogin = async () => {
      const savedUser = await AsyncStorage.getItem("user");
      if (savedUser) {
        navigation.replace("HomeScreen");
      }
    };
    checkLogin();
  }, []);

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert(
        t("playerNameLabels.errorTitle"),
        t("playerNameLabels.errorEmptyName")
      );
      return;
    }

    Alert.alert(
      t("confirmTitle"),
      t("confirmLogin", { name: username.trim() }),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("yes"),
          onPress: async () => {
            try {
              await AsyncStorage.setItem("user", username.trim());
              navigation.replace("CreateCharacterScreen");
            } catch (err) {
              Alert.alert(t("errorTitle"), t("loginFailed"));
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("loginTitle")}</Text>
      <TextInput
        placeholder={t("playerNameLabels.newNamePlaceholder")}
        placeholderTextColor={theme.placeholderTextColor || "#fff"}
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
      />
      <TouchableOpacity
        style={[styles.button, !username.trim() && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={!username.trim()}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {t("playerNameLabels.saveButton")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

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
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 5,
    },
    input: {
      width: "100%",
      backgroundColor: theme.inputBackground || theme.shadowColor,
      borderColor: theme.borderColor,
      borderWidth: 2,
      borderRadius: 14,
      fontSize: 18,
      color: theme.textColor,
      paddingVertical: 12,
      paddingHorizontal: 18,
      marginBottom: 24,
      shadowColor: theme.accentColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    button: {
      backgroundColor: theme.accentColor,
      borderRadius: 14,
      paddingVertical: 15,
      width: "100%",
      alignItems: "center",
      shadowColor: theme.accentColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.17,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 2,
      borderColor: theme.borderColor,
    },
    buttonDisabled: {
      backgroundColor: theme.disabledColor || "#334155",
      borderColor: theme.disabledBorderColor || "#64748b",
      opacity: 0.7,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.15,
      textShadowColor: theme.shadowColor,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
  });
}
