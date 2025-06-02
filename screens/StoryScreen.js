// screens/StoryScreen.js
import { useState, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { TabView, TabBar } from "react-native-tab-view";
import ScreenLayout from "../components/ScreenLayout";

import { useChapter } from "../context/ChapterContext";
import { useThemeContext } from "../context/ThemeContext";

import bossData from "../data/bossData.json";
import eventData from "../data/eventData.json";
import characterData from "../data/characterData.json";
import seasonalData from "../data/seasonalData.json";

const initialLayout = { width: Dimensions.get("window").width };
const chapterMap = {
  boss: bossData,
  event: eventData,
  characters: characterData,
  seasonal: seasonalData,
};

function ChapterCard({ item, onPress, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.accentColor,
          borderColor: theme.shadowColor,
          shadowColor: theme.shadowColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          contentFit="contain"
          transition={300}
        />
      )}
      <Text
        style={[styles.title, { color: theme.textColor }]}
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text
        style={[styles.story, { color: theme.textColor }]}
        numberOfLines={2}
      >
        {item.story}
      </Text>
    </TouchableOpacity>
  );
}

export default function StoryScreen() {
  const navigation = useNavigation();
  const { theme, uiThemeType } = useThemeContext();
  const { setChapterProgress, setChapterType } = useChapter();

  const [index, setIndex] = useState(0);
  const routes = useMemo(
    () => [
      { key: "boss", title: "Boss" },
      { key: "event", title: "Events" },
      { key: "characters", title: "Charaktere" },
      { key: "seasonal", title: "Saisonal" },
    ],
    []
  );

  const handleIndexChange = useCallback(
    (newIndex) => {
      setIndex(newIndex);
      const type = routes[newIndex].key;
      setChapterType(type);
      setChapterProgress(0, type);
    },
    [routes, setChapterProgress, setChapterType]
  );

  const renderScene = useCallback(
    ({ route }) => {
      const data = chapterMap[route.key] || [];
      if (data.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textColor }]}>
              Keine Einträge vorhanden.
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={data}
          keyExtractor={(item) => item.bossName || item.title}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item, index: idx }) => (
            <ChapterCard
              item={item}
              theme={theme}
              onPress={() => {
                setChapterProgress(idx, route.key);
                navigation.navigate("BossScreenView", {
                  bossName: item.bossName,
                  chapterType: route.key,
                });
              }}
            />
          )}
        />
      );
    },
    [navigation, setChapterProgress, theme]
  );

  return (
    <ScreenLayout style={styles.safe}>
      <View style={styles.overlay} />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: theme.accentColor, shadowOpacity: 0 }}
            indicatorStyle={{ backgroundColor: theme.textColor }}
            labelStyle={{ color: theme.textColor, fontWeight: "bold" }}
          />
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject },
  overlay: { ...StyleSheet.absoluteFillObject },
  listContainer: { padding: 20, paddingTop: 80, paddingBottom: 100 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyText: { fontStyle: "italic" },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    alignItems: "center",
  },
  image: { width: "100%", height: 180, borderRadius: 8, marginBottom: 12 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  story: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
