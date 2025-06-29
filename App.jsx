import { useState, useMemo } from "react";
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
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { getClassImageUrl } from "./utils/classUtils";
import { getBossImageUrl } from "./utils/boss/bossUtils";
import { getSkillImageUrl } from "./utils/skillUtils";
import { getBossBackgroundUrl } from "./utils/boss/backgroundUtils";
import newsData from "./data/newsData.json";
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

// --------------------------------------------

function getEventBossKey(url) {
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

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

  // 1. ALLE wichtigen URLs als Array (wichtig: Reihenfolge behalten!)
  const importantImages = [
    getSkillImageUrl("fire"),
    getSkillImageUrl("frostball"),
    getSkillImageUrl("voidrift"),
    getSkillImageUrl("naturball"),
    getSkillImageUrl("stormstrike"),
    getSkillImageUrl("windblade"),
    getClassImageUrl("sylas"),
    getClassImageUrl("void-warrior"),
    getClassImageUrl("ice-warrior"),
    getClassImageUrl("ice-swordswoman"),
    getClassImageUrl("ice-mage"),
    getClassImageUrl("fire-rogue"),
    getClassImageUrl("fire-warrior"),
    getClassImageUrl("fire-knight"),
    getBossImageUrl("infermor"),
    getBossBackgroundUrl("background1"),
    getBossBackgroundUrl("background2"),
    getBossBackgroundUrl("background3"),
    getBossBackgroundUrl("background4"),
    getBossBackgroundUrl("background5"),
    getBossBackgroundUrl("background6"),
    getBossBackgroundUrl("background7"),
    getBossBackgroundUrl("bg_dark"),
    getBossBackgroundUrl("bg_light"),
    bgImage,
    ...newsData.map((e) => e.image),
  ];

  // 2. Preloader nutzen
  const { loaded, progress, localUris } = useImagePreloader(importantImages);

  // Debug-Log: Zeigt alle geladenen URIs
  console.log("importantImages:", importantImages);
  console.log("localUris:", localUris);

  // 3. Mapping für Skills, Klassen, Bosse, BGs und Eventbosse
  const imageMap = useMemo(() => {
    const map = {
      skill_fire: localUris[0],
      skill_frostball: localUris[1],
      skill_voidrift: localUris[2],
      skill_naturball: localUris[3],
      skill_stormstrike: localUris[4],
      skill_windblade: localUris[5],

      class_sylas: localUris[6],
      class_voidwarrior: localUris[7],
      class_icewarrior: localUris[8],
      class_iceswordswoman: localUris[9],
      class_icemage: localUris[10],
      class_firerogue: localUris[11],
      class_firewarrior: localUris[12],
      class_fireknight: localUris[13],

      boss_infermor: localUris[14],

      bg_1: localUris[15],
      bg_2: localUris[16],
      bg_3: localUris[17],
      bg_4: localUris[18],
      bg_5: localUris[19],
      bg_6: localUris[20],
      bg_7: localUris[21],
      bg_dark: localUris[22],
      bg_light: localUris[23],
      bg_main: localUris[24],
    };

    // Eventbosse/News ab 25:
    const startIdx = 25;
    newsData.forEach((event, idx) => {
      const key = getEventBossKey(event.image);
      if (key && localUris[startIdx + idx]) {
        map[key] = localUris[startIdx + idx];
      }
    });

    // Debug-Log: Mapping zeigen
    console.log("imageMap KEYS:", Object.keys(map));
    console.log("imageMap.boss_infermor:", map["boss_infermor"]);
    return map;
  }, [localUris]);

  // 4. Dein gecachtes BG-Image (z.B. für den Hintergrund)
  const localBgImage = imageMap[theme.bgImage] || theme.bgImage;
  // Debug-Log für Backgrounds
  console.log("theme.bgImage:", theme.bgImage);
  console.log("localBgImage:", localBgImage);

  if (!loaded) {
    const progressPercent = Math.min(Math.round(progress * 100), 100);

    return (
      <View style={styles.loadingContainer}>
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

  // Für weitere Screens das imageMap weitergeben!
  return (
    <OnlineGuard>
      <SafeAreaView style={styles.safeArea}>
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
        <NavigationContainer
          theme={navigationTheme}
          onStateChange={onNavigationStateChange}
        >
          {/* imageMap und localUris können als Prop weitergereicht werden */}
          <MainStackNavigator
            data={data}
            localUris={localUris}
            imageMap={imageMap}
          />
        </NavigationContainer>
        <LoadingOverlay />
        {updateVisible && <UpdateOverlay done={updateDone} />}
      </SafeAreaView>
    </OnlineGuard>
  );
}

// --------------------------------------------

export default function App() {
  return (
    <AppProviders>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </AppProviders>
  );
}

// --------------------------------------------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
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
    fontFamily: "sans-serif",
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
    fontFamily: "sans-serif",
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
