import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
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

// ---- Memoized Input Component ----
const UsernameInput = React.memo(function UsernameInput({
  value,
  onChange,
  placeholder,
  theme,
  inputRef,
  onClear,
  onSubmit,
  isDisabled,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor={
          theme.placeholderTextColor || theme.textColor + "77"
        }
        style={styles.input}
        value={value}
        onChangeText={onChange}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={24}
        returnKeyType="done"
        onSubmitEditing={isDisabled ? undefined : onSubmit}
      />
      {!!value && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={onClear}
          hitSlop={16}
        >
          <Ionicons name="close-circle" size={22} color={theme.glowColor} />
        </TouchableOpacity>
      )}
    </View>
  );
});

// ---- Memoized Button Component ----
const GradientButton = React.memo(function GradientButton({
  title,
  onPress,
  disabled,
  theme,
}) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <TouchableOpacity
      style={[styles.buttonOuter, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
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
        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
});

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const [username, setUsername] = useState("");
  const navigation = useNavigation();
  const inputRef = useRef();

  // Ist schon eingeloggt? Dann skip!
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

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Memoisierte Callbacks, damit UsernameInput nicht neu rendert
  const handleClear = useCallback(() => setUsername(""), []);
  const handleChange = useCallback((val) => setUsername(val), []);

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

      <UsernameInput
        value={username}
        onChange={handleChange}
        placeholder={t("playerNameLabels.newNamePlaceholder")}
        theme={theme}
        inputRef={inputRef}
        onClear={handleClear}
        onSubmit={handleLogin}
        isDisabled={isDisabled}
      />

      <GradientButton
        title={t("playerNameLabels.saveButton")}
        onPress={handleLogin}
        disabled={isDisabled}
        theme={theme}
      />
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
    },
  });
}
