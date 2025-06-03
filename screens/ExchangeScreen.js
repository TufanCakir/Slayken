// screens/ExchangeScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "../components/ScreenLayout";

export default function ExchangeScreen() {
  const { theme } = useThemeContext();

  return (
    <ScreenLayout style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={[styles.text, { color: theme.textColor }]}>
          Coming Soon
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
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
