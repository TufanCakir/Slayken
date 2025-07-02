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
import { getEquipmentImageUrl } from "./utils/equipment/equipment";
import { getItemImageUrl } from "./utils/item/itemUtils";
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

const skillKeys = [
  "fire",
  "frostball",
  "voidrift",
  "naturball",
  "stormstrike",
  "windblade",
];
const classKeys = [
  "sylas",
  "void-warrior",
  "ice-warrior",
  "ice-swordswoman",
  "ice-mage",
  "fire-rogue",
  "fire-warrior",
  "fire-knight",
];
const bossKeys = [
  "infermor",
  "Malzevox",
  "Aurelion",
  "Orionyx",
  "Drogmarth",
  "Korathaz",
  "Ashragul",
];
const bgKeys = [
  "background1",
  "background2",
  "background3",
  "background4",
  "background5",
  "background6",
  "background7",
  "bg_dark",
  "bg_light",
];
const equipmentKeys = ["sword_of_flames"];
const itemKeys = ["coin", "crystal"];

// Helper für News/EventBoss Keys
function getEventBossKey(url) {
  const match = /\/([\w-]+)\.png$/i.exec(url);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

function AppContent() {
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateDone, setUpdateDone] = useState(false);
  const { theme, uiThemeType } = useThemeContext();
  const { data, error } = useDataLoader();
  const onNavigationStateChange = useNavigationLoading({ delay: 700 });

  useUpdateChecker(setUpdateVisible, setUpdateDone);

  // Theme für Navigation
  const baseNavTheme = uiThemeType === "dark" ? NavDarkTheme : NavDefaultTheme;
  const navigationTheme = useMemo(
    () => ({
      ...baseNavTheme,
      colors: { ...baseNavTheme.colors, background: "transparent" },
    }),
    [baseNavTheme]
  );

  // --- Wichtige Images zusammenstellen ---
  const skillImages = skillKeys.map(getSkillImageUrl);
  const classImages = classKeys.map(getClassImageUrl);
  const bossImages = bossKeys.map(getBossImageUrl);
  const bgImages = bgKeys.map(getBossBackgroundUrl);
  const equipmentImages = equipmentKeys.map(getEquipmentImageUrl);
  const itemImages = itemKeys.map(getItemImageUrl);
  const newsImages = newsData.map((e) => e.image);

  const importantImages = [
    ...skillImages,
    ...classImages,
    ...bossImages,
    ...bgImages,
    ...equipmentImages,
    ...itemImages,
    theme.bgImage,
    ...newsImages,
  ];

  // Preloader
  const { loaded, progress, localUris } = useImagePreloader(importantImages, 5); // 5 Bilder pro Chunk

  // imageMap bauen (zuverlässige Reihenfolge!)
  const imageMap = useMemo(() => {
    const map = {};
    let idx = 0;

    skillKeys.forEach((k) => {
      map[`skill_${k}`] = localUris[idx++];
    });
    classKeys.forEach((k) => {
      map[`class_${k.replace(/-/g, "")}`] = localUris[idx++];
    });
    bossKeys.forEach((k) => {
      map[`boss_${k.toLowerCase()}`] = localUris[idx++];
    });
    bgKeys.forEach((k, i) => {
      map[`bg_${i + 1}`] = localUris[idx++];
      if (k.startsWith("bg_")) map[k] = localUris[idx - 1];
    });
    equipmentKeys.forEach((k) => {
      map[`equipment_${k}`] = localUris[idx++];
    });
    itemKeys.forEach((k) => {
      map[k] = localUris[idx++];
    });

    map["bg_main"] = localUris[idx++];
    newsImages.forEach((img, i) => {
      const key = getEventBossKey(img);
      if (key && localUris[idx + i]) {
        map[key] = localUris[idx + i];
      }
    });

    return map;
  }, [localUris, newsImages]);

  // Hintergrund aus Map, fallback auf theme.bgImage
  const localBgImage = imageMap[theme.bgImage] || theme.bgImage;

  // Ladebildschirm
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

  // Fehlerbildschirm
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

  // Main App-UI
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
  },
  errorContainer: {
    flex: 1,
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
