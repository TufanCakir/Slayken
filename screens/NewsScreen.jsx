import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";
import newsData from "../data/newsData.json";
import { t } from "../i18n";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeContext } from "../context/ThemeContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { useAssets } from "../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";

function getEventBossKey(imageUrl) {
  const match = /\/([\w-]+)\.png$/.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

// --------- RewardChip mit React.memo ----------
const RewardChip = React.memo(function RewardChip({ icon, text, theme }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.borderGlowColor + "bb",
        borderRadius: 8,
        paddingVertical: 3,
        paddingHorizontal: 8,
        marginHorizontal: 3,
        shadowColor: theme.borderGlowColor,
        shadowRadius: 5,
        shadowOpacity: 0.17,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <Image
        source={getItemImageUrl(icon)}
        style={{ width: 18, height: 18, marginRight: 4 }}
        contentFit="contain"
      />
      <Text
        style={{
          fontWeight: "bold",
          color: theme.accentColor,
          fontSize: 14,
          letterSpacing: 0.11,
        }}
      >
        {text}
      </Text>
    </View>
  );
});

// --------- NewsItem als eigenes React.memo ----------
const NewsItem = React.memo(function NewsItem({
  item,
  claimed,
  theme,
  imageMap,
  onClaim,
}) {
  const bossKey = getEventBossKey(item.image);
  const imageSource =
    bossKey && imageMap[bossKey] ? imageMap[bossKey] : item.image;

  // Farben aus Theme (oder eigene)
  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  return (
    <TouchableOpacity
      onLongPress={() => onClaim(item)}
      activeOpacity={0.91}
      style={claimed ? styles(theme).itemClaimedWrap : undefined}
      disabled={claimed}
    >
      <View style={[styles(theme).item, claimed && styles(theme).itemClaimed]}>
        {/* LinearGradient als Hintergrund */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Image
          source={imageSource}
          style={styles(theme).image}
          contentFit="contain"
          transition={300}
        />
        <Text style={styles(theme).itemText}>{item.title}</Text>
        {claimed ? (
          <Text style={styles(theme).claimed}>✅ Belohnung erhalten!</Text>
        ) : (
          <View style={styles(theme).tooltip}>
            <RewardChip icon="coin1" text="+100" theme={theme} />
            <RewardChip icon="crystal1" text="+10" theme={theme} />
            <Text style={styles(theme).longpressHint}>
              Long-Press für Belohnung!
            </Text>
          </View>
        )}
        {item.description && (
          <Text style={styles(theme).description}>{item.description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function NewsScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const [claimedNews, setClaimedNews] = useState({});

  // Styles als useMemo – optional für minimale Effizienz
  const memoStyles = useMemo(() => styles(theme), [theme]);

  // Belohnung einlösen
  const handleLongPress = useCallback(
    async (item) => {
      const key = `claimed_news_${item.id}`;
      if (await AsyncStorage.getItem(key)) return;
      addCoins(100);
      addCrystals(10);
      await AsyncStorage.setItem(key, "true");
      setClaimedNews((prev) => ({ ...prev, [item.id]: true }));
    },
    [addCoins, addCrystals]
  );

  // Claims aus Storage laden (nur 1x)
  useEffect(() => {
    (async () => {
      const claims = {};
      for (let item of newsData) {
        if (await AsyncStorage.getItem(`claimed_news_${item.id}`)) {
          claims[item.id] = true;
        }
      }
      setClaimedNews(claims);
    })();
  }, []);

  // Memoisiertes Render-Item für FlatList
  const renderItem = useCallback(
    ({ item }) => (
      <NewsItem
        item={item}
        claimed={claimedNews[item.id]}
        theme={theme}
        imageMap={imageMap}
        onClaim={handleLongPress}
      />
    ),
    [claimedNews, theme, imageMap, handleLongPress]
  );

  return (
    <ScreenLayout style={memoStyles.container}>
      <Text style={memoStyles.header}>{t("newsTitle")}</Text>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={memoStyles.listContainer}
        showsVerticalScrollIndicator={false}
        extraData={claimedNews} // Damit FlatList weiß, wann ein Item sich ändert!
      />
    </ScreenLayout>
  );
}

// ---------- Styles als Factory-Funktion (damit Theme 100% sauber ist) ----------
function styles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      textAlign: "center",
      padding: 16,
      borderRadius: 15,
      marginBottom: 14,
      fontSize: 26,
      color: theme.textColor,
      backgroundColor: theme.accentColor,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.3,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    item: {
      backgroundColor: theme.accentColor,
      borderRadius: 19,
      marginBottom: 22,
      padding: 11,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      alignItems: "center",
    },
    itemClaimed: { opacity: 0.42 },
    itemText: {
      fontSize: 18,
      color: theme.textColor,
      marginTop: 12,
      letterSpacing: 0.14,
      textAlign: "center",
      fontWeight: "bold",
    },
    image: {
      width: "100%",
      height: 170,
      borderRadius: 13,
      marginBottom: 6,
      backgroundColor: theme.shadowColor,
    },
    tooltip: {
      marginTop: 9,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    claimed: {
      marginTop: 10,
      color: theme.borderGlowColor,
      fontSize: 15,
      textAlign: "center",
      fontWeight: "700",
      fontStyle: "italic",
      letterSpacing: 0.12,
    },
    description: {
      color: theme.textColor,
      fontSize: 13.5,
      textAlign: "center",
      marginTop: 8,
      opacity: 0.86,
    },
    longpressHint: {
      fontSize: 12.5,
      color: theme.textColor,
      marginLeft: 7,
      fontStyle: "italic",
      fontWeight: "500",
      letterSpacing: 0.08,
      opacity: 0.8,
    },
    itemClaimedWrap: {},
  });
}
