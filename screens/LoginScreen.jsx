import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { t } from "../i18n";
import { useThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState("");
  const navigation = useNavigation();
  const inputRef = useRef();

  // Bei Mount: Ist schon eingeloggt? Dann skip!
  useEffect(() => {
    AsyncStorage.getItem("user").then((savedUser) => {
      if (savedUser) navigation.replace("HomeScreen");
    });
    // Autofokus fürs Input
    setTimeout(() => inputRef.current?.focus(), 200);
  }, [navigation]);

  const isDisabled = !username.trim();

  const handleLogin = useCallback(() => {
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
  }, [username, navigation]);

  const styles = createStyles(theme);

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

      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
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
          returnKeyType="done"
          onSubmitEditing={isDisabled ? undefined : handleLogin}
        />
        {!!username && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setUsername("")}
            hitSlop={16}
          >
            <Ionicons name="close-circle" size={22} color={theme.glowColor} />
          </TouchableOpacity>
        )}
      </View>

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
      backgroundColor: theme.bgColor || theme.accentColor + "05",
    },
    headerGradient: {
      borderRadius: 18,
      marginBottom: 32,
      paddingVertical: 20,
      paddingHorizontal: 40,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 17,
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 8 },
      elevation: 7,
      minWidth: 200,
      maxWidth: 380,
      width: "95%",
    },
    title: {
      fontSize: 28,
      color: theme.textColor,
      textAlign: "center",
      letterSpacing: 1,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 11,
      textShadowOffset: { width: 0, height: 2 },
      textTransform: "uppercase",
    },
    inputWrapper: {
      width: "100%",
      position: "relative",
      marginBottom: 26,
      justifyContent: "center",
      alignItems: "center",
    },
    input: {
      width: "100%",
      backgroundColor: theme.inputBackground || theme.shadowColor,
      borderRadius: 14,
      fontSize: 19,
      color: theme.textColor,
      paddingVertical: Platform.OS === "ios" ? 15 : 10,
      paddingHorizontal: 20,
      borderWidth: 1.4,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 3,
      paddingRight: 40, // Platz für das X
    },
    clearButton: {
      position: "absolute",
      right: 12,
      top: Platform.OS === "ios" ? 12 : 8,
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
      paddingVertical: 17,
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    buttonDisabled: {
      opacity: 0.43,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 19,
      letterSpacing: 0.19,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
  });
}
