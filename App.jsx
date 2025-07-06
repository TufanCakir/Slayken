import React, { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView as RNSafeAreaView,
  ActivityIndicator,
} from "react-native";
import { enableScreens } from "react-native-screens";
enableScreens();

import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { AssetsProvider } from "./context/AssetsContext";
import { buildImageMap } from "./utils/imageMapBuilder";
import { getImportantImages } from "./utils/imageHelper";

import { AppProviders } from "./providers/AppProviders";
import useUpdateChecker from "./hooks/useUpdateChecker";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { useThemeContext } from "./context/ThemeContext";
import LoadingOverlay from "./components/LoadingOverlay";
import useDataLoader from "./hooks/useDataLoader";
import useNavigationLoading from "./hooks/useNavigationLoading";
import OnlineGuard from "./components/OnlineGuard";
import UpdateOverlay from "./components/UpdateOverlay";
import useImagePreloader from "./hooks/useImagePreloader";

function AppContent() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateDone, setUpdateDone] = useState(false);
  const { theme, uiThemeType } = useThemeContext();
  const { data, error } = useDataLoader();
  const onNavigationStateChange = useNavigationLoading({ delay: 700 });

  useUpdateChecker(setUpdateVisible, setUpdateDone);

  // Navigation Theme dynamisch
  const baseNavTheme = useMemo(
    () => (uiThemeType === "dark" ? NavDarkTheme : NavDefaultTheme),
    [uiThemeType]
  );
  const navigationTheme = useMemo(
    () => ({
      ...baseNavTheme,
      colors: { ...baseNavTheme.colors, background: "transparent" },
    }),
    [baseNavTheme]
  );

  // Alle wichtigen Bilder zum Preloaden
  const { images: importantImages, newsImages } = useMemo(
    () => getImportantImages(theme.bgImage),
    [theme.bgImage]
  );

  // Lade alle Images, Chunkweise (5er Gruppen)
  const { loaded, progress, localUris } = useImagePreloader(importantImages, 5);

  // Erzeuge ein ImageMap-Objekt aus geladenen URIs
  const imageMap = useMemo(
    () => buildImageMap(localUris, newsImages),
    [localUris, newsImages]
  );

  // Theme-spezifisches Hintergrundbild, immer lokal wenn geladen
  const localBgImage = useMemo(
    () => imageMap[theme.bgImage] || theme.bgImage,
    [imageMap, theme.bgImage]
  );

  // Progressbar für Ladeanzeige
  const progressPercent = Math.min(Math.round(progress * 100), 100);

  // Ladeanzeige solange nicht alles da
  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
        />
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Lädt Assets… {progressPercent}%</Text>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>
    );
  }

  // Fehleranzeige
  if (error) {
    return (
      <RNSafeAreaView style={styles.errorContainer}>
        <Image
          source={localBgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.errorOverlay}>
          <Text style={[styles.errorText, { color: theme.accentColor }]}>
            Oops, da ist etwas schiefgelaufen…
          </Text>
        </View>
      </RNSafeAreaView>
    );
  }

  // Main-App
  return (
    <OnlineGuard>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Hintergrundbild für gesamte App */}
        <Image
          source={localBgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
        />
        <AssetsProvider value={{ data, localUris, imageMap }}>
          <NavigationContainer
            theme={navigationTheme}
            onStateChange={onNavigationStateChange}
          >
            <MainStackNavigator />
            <LoadingOverlay />
          </NavigationContainer>
        </AssetsProvider>
        {updateVisible && <UpdateOverlay done={updateDone} />}
      </SafeAreaView>
    </OnlineGuard>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#1e293b",
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(60, 29, 29, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 12,
    fontSize: 16,
  },
  progressBarBackground: {
    width: "80%",
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#22d3ee",
  },
});
