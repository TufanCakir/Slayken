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
import { LinearGradient } from "expo-linear-gradient";

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
      {/* Gradient-Header */}
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0.07, 0]}
        end={[1, 1]}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>{t("loginTitle")}</Text>
      </LinearGradient>

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
      {/* Button mit Gradient */}
      <TouchableOpacity
        style={[styles.buttonOuter, isDisabled && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isDisabled}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[
            theme.accentColorSecondary,
            theme.accentColor,
            theme.accentColorDark,
          ]}
          start={[0.1, 0]}
          end={[1, 1]}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {t("playerNameLabels.saveButton")}
          </Text>
        </LinearGradient>
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
    headerGradient: {
      borderRadius: 16,
      marginBottom: 30,
      paddingVertical: 16,
      paddingHorizontal: 38,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 16,
      shadowOpacity: 0.33,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    title: {
      fontSize: 26,
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 0.7,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 10,
      textShadowOffset: { width: 0, height: 2 },
      textTransform: "uppercase",
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
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.09,
      shadowRadius: 7,
      elevation: 3,
    },
    buttonOuter: {
      width: "100%",
      borderRadius: 14,
      overflow: "hidden",
      shadowColor: theme.glowColor,
      shadowRadius: 10,
      shadowOpacity: 0.3,
      elevation: 5,
    },
    button: {
      borderRadius: 14,
      paddingVertical: 15,
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.45,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 18,
      letterSpacing: 0.18,
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
  });
}
