import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
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

// Helper: Extrahiert eventboss-Key aus einer Bild-URL
function getEventBossKey(imageUrl) {
  const match = /\/([\w-]+)\.png$/.exec(imageUrl);
  return match ? "eventboss_" + match[1].toLowerCase() : null;
}

export default function NewsScreen({ imageMap = {} }) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const [claimedNews, setClaimedNews] = useState({});

  const handleLongPress = async (item) => {
    const key = `claimed_news_${item.id}`;
    const alreadyClaimed = await AsyncStorage.getItem(key);
    if (alreadyClaimed) return;
    addCoins(100);
    addCrystals(10);
    await AsyncStorage.setItem(key, "true");
    setClaimedNews((prev) => ({ ...prev, [item.id]: true }));
  };

  useEffect(() => {
    const loadClaimed = async () => {
      const claims = {};
      for (let item of newsData) {
        const key = `claimed_news_${item.id}`;
        const value = await AsyncStorage.getItem(key);
        if (value) claims[item.id] = true;
      }
      setClaimedNews(claims);
    };
    loadClaimed();
  }, []);

  const renderItem = ({ item }) => {
    const claimed = claimedNews[item.id];
    const bossKey = getEventBossKey(item.image);
    const imageSource =
      bossKey && imageMap[bossKey] ? imageMap[bossKey] : item.image;

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.item}>
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={250}
          />
          <Text style={styles.itemText}>{item.title}</Text>
          {claimed ? (
            <Text style={styles.claimed}>✅ Belohnung erhalten!</Text>
          ) : (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Halten für Belohnung: </Text>
              <Image
                source={getItemImageUrl("coin")}
                style={styles.rewardIcon}
                contentFit="contain"
              />
              <Text style={styles.tooltipText}> +100 </Text>
              <Image
                source={getItemImageUrl("crystal")}
                style={styles.rewardIcon}
                contentFit="contain"
              />
              <Text style={styles.tooltipText}> +10</Text>
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

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      textAlign: "center",
      padding: 16,
      borderRadius: 14,
      marginBottom: 12,
      fontSize: 25,
      color: theme.textColor,
      backgroundColor: theme.accentColor,
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
    },
    itemText: {
      fontSize: 17,
      color: theme.textColor,
      marginTop: 12,
      letterSpacing: 0.12,
    },
    image: {
      width: "100%",
      height: 165,
    },
    tooltip: {
      marginTop: 6,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    tooltipText: {
      fontSize: 13,
      color: theme.textColor,
    },
    rewardIcon: {
      width: 18,
      height: 18,
      marginHorizontal: 2,
      marginBottom: -1,
    },
    claimed: {
      marginTop: 6,
      color: theme.textColor,
      fontSize: 13,
      textAlign: "center",
    },
    description: {
      color: theme.textColor,
      fontSize: 13,
      textAlign: "center",
      marginTop: 6,
    },
  });
}
