// App.js
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Platform,
  SafeAreaView as RNSafeAreaView,
} from "react-native";
import { enableScreens } from "react-native-screens";
enableScreens();

import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { AppProviders } from "./providers/AppProviders";
import useUpdateChecker from "./hooks/useUpdateChecker";
import MainStackNavigator from "./navigation/MainStackNavigator";
import { useThemeContext } from "./context/ThemeContext";
import LoadingOverlay from "./components/LoadingOverlay";
import useDataLoader from "./hooks/useDataLoader";
import useNavigationLoading from "./hooks/useNavigationLoading";
import OnlineGuard from "./components/OnlineGuard";

function AppContent() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const { theme, uiThemeType } = useThemeContext();
  const { data, error } = useDataLoader();
  const onNavigationStateChange = useNavigationLoading();

  useUpdateChecker(setUpdateVisible);

  // Globales Hintergrundbild aus dem Theme
  const bgImage = theme.bgImage;

  // Navigation-Theme auf transparenten Hintergrund setzen
  const baseNavTheme = uiThemeType === "dark" ? NavDarkTheme : NavDefaultTheme;
  const navigationTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: "transparent",
    },
  };

  // Fehlerzustand
  if (error) {
    return (
      <RNSafeAreaView style={styles.errorContainer}>
        <Image
          source={bgImage}
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

  return (
    <OnlineGuard>
      <SafeAreaView
        style={[
          styles.safeArea,
          // Android SafeAreaView verwendet Padding für StatusBar
          Platform.OS === "android" && { paddingTop: StatusBar.currentHeight },
        ]}
      >
        {/* Globales Hintergrundbild */}
        <Image
          source={bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        {/* Transparente StatusBar */}
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
        />
        {/* Navigation */}
        <NavigationContainer
          theme={navigationTheme}
          onStateChange={onNavigationStateChange}
        >
          <MainStackNavigator data={data} />
        </NavigationContainer>
        {/* Lade-Overlay */}
        <LoadingOverlay />
        {/* Update-Overlay wenn Update geladen wird */}
        {updateVisible && <UpdateOverlay />}
      </SafeAreaView>
    </OnlineGuard>
  );
}

const UpdateOverlay = () => (
  <View style={styles.updateOverlay}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={styles.updateText}>Update wird geladen…</Text>
  </View>
);

export default function App() {
  return (
    <AppProviders>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // lässt das Hintergrund-Image durchscheinen
  },
  errorContainer: {
    flex: 1,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 20,
    // Platform-spezifische Schriftfamilie
    fontFamily: Platform.OS === "android" ? "Roboto" : "Helvetica",
  },
  updateOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 1000,
  },
  updateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
  },
});
