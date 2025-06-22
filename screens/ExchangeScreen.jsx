// screens/ExchangeScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "../components/ScreenLayout";
import { Ionicons } from "@expo/vector-icons"; // für Icon

export default function ExchangeScreen() {
  const { theme } = useThemeContext();

  return (
    <ScreenLayout style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons
          name="lock-closed-outline"
          size={48}
          color="#3b82f6"
          style={{ marginBottom: 16 }}
        />
        <Text style={[styles.title, { color: theme.textColor }]}>
          Tauschladen bald verfügbar
        </Text>
        <Text style={[styles.subtitle, { color: "#fff" }]}>
          Halte Ausschau nach künftigen Updates. Hier kannst du bald Belohnungen
          gegen Items eintauschen.
        </Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#94a3b8",
    lineHeight: 20,
  },
});
