// App.js
import React, { useContext, useState, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";

import AppNavigator from "./src/mavigation/AppNavigator";
import AppProviders from "./src/AppProviders";
import useUpdateChecker from "./src/hooks/useUpdateChecker";

import {
  BackgroundProvider,
  BackgroundContext,
} from "./src/context/BackgroundContext";
import { AccountProvider } from "./src/context/AccountContext";
import { PreloadDataProvider } from "./src/context/PreloadDataContext";
import { CoinsProvider } from "./src/context/CoinsContext";
import { CrystalsProvider } from "./src/context/CrystalsContext";

export default function App() {
  // Update Checker-Hook ausführen
  useUpdateChecker();

  // Globaler Ladeindikator-Zustand
  const [loading, setLoading] = useState(false);
  const loadingTimeoutRef = useRef(null);

  // Bei jeder Navigationsänderung wird der Ladeindikator angezeigt
  const handleNavigationStateChange = (state) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    setLoading(true);
    loadingTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <BackgroundProvider>
      <AppProviders>
        <GestureHandlerRootView style={styles.flex}>
          <BackgroundContainer>
            <SafeAreaView style={styles.flex}>
              <PreloadDataProvider>
                <AccountProvider>
                  <CoinsProvider>
                    <CrystalsProvider>
                      <NavigationContainer
                        onStateChange={handleNavigationStateChange}
                      >
                        <AppNavigator />
                      </NavigationContainer>
                      {loading && <LoadingOverlay />}
                      {/* Weitere Komponenten können hier hinzugefügt werden */}
                    </CrystalsProvider>
                  </CoinsProvider>
                </AccountProvider>
              </PreloadDataProvider>
            </SafeAreaView>
          </BackgroundContainer>
        </GestureHandlerRootView>
      </AppProviders>
    </BackgroundProvider>
  );
}

// Container-Komponente für den dynamischen Hintergrund
const BackgroundContainer = ({ children }) => {
  const { backgroundColors } = useContext(BackgroundContext);
  return (
    <View
      style={[
        styles.fullscreen,
        { backgroundColor: backgroundColors[0] || "black" },
      ]}
    >
      {children}
    </View>
  );
};

// Globaler Ladeindikator mit dynamischer Farbe
const LoadingOverlay = () => {
  const { backgroundColors } = useContext(BackgroundContext);
  const defaultColors = ["black", "blue", "black"]; // Standard-Farbverlauf
  const loaderColor = backgroundColors?.[1] || defaultColors[1];

  return (
    <View
      style={[
        styles.loadingOverlay,
        { backgroundColor: backgroundColors[0] || defaultColors[0] },
      ]}
    >
      <ActivityIndicator size="large" color={loaderColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  fullscreen: {
    flex: 1,
    position: "absolute", // Verhindert UI-Flackern
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999, // Immer im Vordergrund
  },
});
