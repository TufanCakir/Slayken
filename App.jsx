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
import UpdateOverlay from "./components/UpdateOverlay"; // <--- Import hinzufügen

function AppContent() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateDone, setUpdateDone] = useState(false);
  const { theme, uiThemeType } = useThemeContext();
  const { data, error } = useDataLoader();
  const onNavigationStateChange = useNavigationLoading();

  useUpdateChecker(setUpdateVisible, setUpdateDone);

  const bgImage = theme.bgImage;
  const baseNavTheme = uiThemeType === "dark" ? NavDarkTheme : NavDefaultTheme;
  const navigationTheme = {
    ...baseNavTheme,
    colors: {
      ...baseNavTheme.colors,
      background: "transparent",
    },
  };

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
          Platform.OS === "android" && { paddingTop: StatusBar.currentHeight },
        ]}
      >
        <Image
          source={bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
        />
        <NavigationContainer
          theme={navigationTheme}
          onStateChange={onNavigationStateChange}
        >
          <MainStackNavigator data={data} />
        </NavigationContainer>
        <LoadingOverlay />
        {updateVisible && <UpdateOverlay done={updateDone} />}
      </SafeAreaView>
    </OnlineGuard>
  );
}

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
  safeArea: { flex: 1, backgroundColor: "transparent" },
  errorContainer: { flex: 1 },
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
    fontFamily: Platform.OS === "android" ? "Roboto" : "Helvetica",
  },
});
