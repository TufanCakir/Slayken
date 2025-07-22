import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
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

import { buildImageMap } from "./utils/imageMapBuilder";
import { getImportantImages } from "./utils/imageHelper";
import { AppProviders } from "./providers/AppProviders";
import useUpdateChecker from "./hooks/useUpdateChecker";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { useThemeContext } from "./context/ThemeContext";
import useDataLoader from "./hooks/useDataLoader";
import OnlineGuard from "./components/OnlineGuard";
import UpdateOverlay from "./components/UpdateOverlay";
import useImagePreloader from "./hooks/useImagePreloader";

const ProgressBar = React.memo(({ percent }) => (
  <View style={styles.progressBarBackground}>
    <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
  </View>
));

const BackgroundImage = React.memo(({ source }) =>
  source ? (
    <Image
      source={source}
      style={StyleSheet.absoluteFill}
      contentFit="cover"
      transition={300}
      cachePolicy="memory"
    />
  ) : null
);

const ErrorScreen = React.memo(({ errorText, accentColor, bgImage }) => (
  <SafeAreaView style={styles.errorContainer} edges={["top", "right", "left"]}>
    <BackgroundImage source={bgImage} />
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle="light-content"
    />
    <View style={styles.errorOverlay}>
      <Text style={[styles.errorText, { color: accentColor }]}>
        {errorText}
      </Text>
    </View>
  </SafeAreaView>
));

const LoadingScreen = React.memo(({ percent, bgImage, themeType }) => (
  <SafeAreaView
    style={styles.loadingContainer}
    edges={["top", "right", "left"]}
  >
    <BackgroundImage source={bgImage} />
    <StatusBar
      translucent
      backgroundColor="transparent"
      barStyle={themeType === "dark" ? "light-content" : "dark-content"}
    />
    <View style={styles.loadingContent}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>Lädt Assets… {percent}%</Text>
      <ProgressBar percent={percent} />
    </View>
  </SafeAreaView>
));

function AppContent() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateDone, setUpdateDone] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);

  const { theme, uiThemeType } = useThemeContext();
  const { error } = useDataLoader();

  useUpdateChecker(setUpdateVisible, setUpdateDone);

  // Navigation Theme
  const navigationTheme = useMemo(() => {
    const baseTheme = uiThemeType === "dark" ? NavDarkTheme : NavDefaultTheme;
    return {
      ...baseTheme,
      colors: { ...baseTheme.colors, background: "transparent" },
    };
  }, [uiThemeType]);

  // Image preload
  const { images: importantImages, newsImages } = useMemo(
    () => getImportantImages(theme.bgImage),
    [theme.bgImage]
  );
  const { loaded, progress, localUris } = useImagePreloader(importantImages, 5);
  const imageMap = useMemo(
    () => buildImageMap(localUris, newsImages),
    [localUris, newsImages]
  );
  const localBgImage = useMemo(
    () => imageMap[theme.bgImage] || theme.bgImage,
    [imageMap, theme.bgImage]
  );
  const progressPercent = Math.min(Math.round(progress * 100), 100);

  // Navigation loading handling
  const handleStateChange = () => {
    setIsNavLoading(true);
    // Minimal delay so spinner doesn't flicker on fast transitions
    setTimeout(() => setIsNavLoading(false), 600);
  };

  if (!loaded) {
    return (
      <LoadingScreen
        percent={progressPercent}
        bgImage={localBgImage}
        themeType={uiThemeType}
      />
    );
  }

  if (error) {
    return (
      <ErrorScreen
        errorText="Oops, da ist etwas schiefgelaufen…"
        accentColor={theme.accentColor}
        bgImage={localBgImage}
      />
    );
  }

  return (
    <OnlineGuard>
      <SafeAreaView style={styles.safeArea}>
        <BackgroundImage source={localBgImage} />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
        />
        <NavigationContainer
          theme={navigationTheme}
          onStateChange={handleStateChange}
        >
          <MainStackNavigator />
          {isNavLoading && (
            <View style={styles.globalLoader}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </NavigationContainer>
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
  loadingContent: {
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
  globalLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    zIndex: 1000,
  },
});
