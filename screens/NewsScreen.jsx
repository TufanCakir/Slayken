import React, { useState, useEffect } from "react";
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

// Bild-Key-Helfer
function getEventBossKey(imageUrl) {
  const match = /\/([\w-]+)\.png$/.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

export default function NewsScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const [claimedNews, setClaimedNews] = useState({});
  const styles = createStyles(theme);

  // Belohnung einlösen
  const handleLongPress = async (item) => {
    const key = `claimed_news_${item.id}`;
    if (await AsyncStorage.getItem(key)) return;
    addCoins(100);
    addCrystals(10);
    await AsyncStorage.setItem(key, "true");
    setClaimedNews((prev) => ({ ...prev, [item.id]: true }));
  };

  // Bereits eingelöste News laden
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

  // News-Eintrag-Render
  const renderItem = ({ item }) => {
    const claimed = claimedNews[item.id];
    const bossKey = getEventBossKey(item.image);
    const imageSource =
      bossKey && imageMap[bossKey] ? imageMap[bossKey] : item.image;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.9}
        style={claimed ? styles.itemClaimedWrap : undefined}
      >
        <View style={[styles.item, claimed && styles.itemClaimed]}>
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />
          <Text style={styles.itemText}>{item.title}</Text>
          {claimed ? (
            <Text style={styles.claimed}>✅ Belohnung erhalten!</Text>
          ) : (
            <View style={styles.tooltip}>
              <RewardDisplay />
            </View>
          )}
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      <Text style={styles.header}>{t("newsTitle")}</Text>
      <FlatList
        data={newsData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </ScreenLayout>
  );
}

// Hilfs-Komponente für die Belohnungsanzeige (verhindert Duplikate)
function RewardDisplay() {
  return (
    <>
      <Text style={{ fontSize: 13 }}>Halten für Belohnung:</Text>
      <Image
        source={getItemImageUrl("coin")}
        style={rewardIconStyle}
        contentFit="contain"
      />
      <Text style={{ fontSize: 13, color: "white" }}>+100</Text>
      <Image
        source={getItemImageUrl("crystal")}
        style={rewardIconStyle}
        contentFit="contain"
      />
      <Text style={{ fontSize: 13, color: "white" }}>+10</Text>
    </>
  );
}

const rewardIconStyle = {
  width: 18,
  height: 18,
  marginHorizontal: 2,
  marginBottom: -1,
};

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    header: {
      textAlign: "center",
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      fontSize: 25,
      color: theme.textColor,
      backgroundColor: theme.accentColor,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    listContainer: {
      paddingHorizontal: 18,
      paddingBottom: 80,
    },
    item: {
      backgroundColor: theme.accentColor,
      borderRadius: 18,
      marginBottom: 18,
      padding: 10,
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
    },
    itemClaimed: { opacity: 0.5 },
    itemText: {
      fontSize: 17,
      color: theme.textColor,
      marginTop: 12,
      letterSpacing: 0.12,
      textAlign: "center",
      fontWeight: "bold",
    },
    image: {
      width: "100%",
      height: 165,
      borderRadius: 12,
    },
    tooltip: {
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 4,
    },
    claimed: {
      marginTop: 8,
      color: theme.textColor,
      fontSize: 13,
      textAlign: "center",
      fontStyle: "italic",
      fontWeight: "500",
    },
    description: {
      color: theme.textColor,
      fontSize: 13,
      textAlign: "center",
      marginTop: 6,
    },
    itemClaimedWrap: {
      // Falls du einen zusätzlichen Stil für geklickte News brauchst
    },
  });
}
