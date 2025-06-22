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

export default function LoginScreen() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("loginTitle")}</Text>
      <TextInput
        placeholder={t("playerNameLabels.newNamePlaceholder")}
        placeholderTextColor="#7dd3fc"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 26,
    color: "#60a5fa",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.3,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  input: {
    width: "100%",
    backgroundColor: "#1e293b",
    borderColor: "#2563eb",
    borderWidth: 2,
    borderRadius: 14,
    fontSize: 18,
    color: "#f0f9ff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 24,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    paddingVertical: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "#38bdf8",
  },
  buttonDisabled: {
    backgroundColor: "#334155",
    borderColor: "#64748b",
    opacity: 0.7,
  },
  buttonText: {
    color: "#f0f9ff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.15,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
