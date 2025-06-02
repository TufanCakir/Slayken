// Datei: screens/SummonResultScreen.js

import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useThemeContext } from "../context/ThemeContext";
import { Image } from "expo-image";
import Footer from "../components/Footer";
import rarityData from "../data/rarityData.json";

// Basis-URL für Avatare
const GITHUB_BASE =
  "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/characters";

// Berechne dreispaltige Kartengröße basierend auf Bildschirmbreite
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 8 * 2; // paddingHorizontal von FlatList-Container
const CARD_MARGIN = 6 * 2; // marginHorizontal * 2
const NUM_COLUMNS = 3;
const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING - CARD_MARGIN * NUM_COLUMNS) / NUM_COLUMNS;

// Memoisierte Einzelkarte
const SummonedCard = React.memo(function SummonedCard({
  character,
  theme,
  uiThemeType,
}) {
  const { id, name, type, level, rarity, avatar } = character;
  const rarityInfo = rarityData.rarities[rarity] || {};
  const borderColor = rarityInfo.color ?? theme.accentColor;
  const backgroundColor = uiThemeType === "dark" ? "#000" : "#fff";
  const avatarUri = `${GITHUB_BASE}/${avatar}`;

  return (
    <View
      style={[styles.card, { borderColor, backgroundColor, width: CARD_WIDTH }]}
    >
      <Image
        source={{ uri: avatarUri }}
        style={styles.avatar}
        contentFit="contain"
      />

      <Text style={[styles.name, { color: theme.textColor }]} numberOfLines={1}>
        {name}
      </Text>

      <Text
        style={[styles.type, { color: theme.shadowColor }]}
        numberOfLines={1}
      >
        {type}
      </Text>

      <Text style={[styles.level, { color: theme.textColor }]}>
        Level {level}
      </Text>

      {rarityInfo.label && (
        <Text style={[styles.rarity, { color: rarityInfo.color }]}>
          {rarityInfo.label}
        </Text>
      )}
    </View>
  );
});

export default function SummonResultScreen() {
  const navigation = useNavigation();
  const { theme, uiThemeType } = useThemeContext();
  const route = useRoute();
  const results = useMemo(() => route.params?.results ?? [], [route.params]);

  // Key-Extractor für FlatList
  const keyExtractor = useCallback((item, index) => `${item.id}-${index}`, []);

  // Fallback-Komponente, wenn keine Ergebnisse vorliegen
  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textColor }]}>
          Du hast noch keine Charaktere beschworen.
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.accentColor }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.textColor }]}>
            Zurück Beschwören
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [navigation, theme]
  );

  // Einzelner List-Item-Renderer
  const renderItem = useCallback(
    ({ item }) => (
      <SummonedCard character={item} theme={theme} uiThemeType={uiThemeType} />
    ),
    [theme, uiThemeType]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <FlatList
        data={results}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  card: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    margin: 6,
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  name: {
    marginTop: 6,
    fontWeight: "600",
    fontSize: 13,
    textAlign: "center",
  },
  type: {
    fontSize: 11,
    marginTop: 2,
  },
  level: {
    fontSize: 11,
    marginTop: 2,
  },
  rarity: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
