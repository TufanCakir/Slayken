// src/navigation/AppNavigator.js
import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import { BackgroundContext } from "../context/BackgroundContext";
import { LinearGradient } from "expo-linear-gradient"; // 🔹 Gradient importieren
import { screens } from "./screens";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { backgroundColors } = useContext(BackgroundContext);
  const defaultColors = ["black", "blue", "black"]; // 🔹 Standard-Farbverlauf

  return (
    <LinearGradient
      colors={backgroundColors || defaultColors}
      style={styles.container}
    >
      <Stack.Navigator
        initialRouteName="StartScreen"
        screenOptions={{
          headerStyle: { backgroundColor: "transparent" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontSize: 20, fontWeight: "bold" },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          cardStyle: { backgroundColor: "rgba(0,0,0,0)" }, // ✅ Fix: Verhindert Übergangs-Flackern
        }}
      >
        {screens.map(({ name, component, title, headerShown = false }) => (
          <Stack.Screen
            key={name}
            name={name}
            component={component}
            options={{ title, headerShown }}
          />
        ))}
      </Stack.Navigator>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
