import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";
import newsData from "../data/newsData.json";
import { t } from "../i18n";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";

// Farben
const BLUE_BG = "#0f172a";
const BLUE_CARD = "#1e293b";
const BLUE_BORDER = "#2563eb";
const BLUE_SHADOW = "#60a5fa";
const BLUE_ACCENT = "#38bdf8";
const BLUE_TEXT = "#f0f9ff";
const BLUE_MUTED = "#a7c7e7";

export default function NewsScreen() {
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const [claimedNews, setClaimedNews] = useState({});

  const handleLongPress = async (item) => {
    const key = `claimed_news_${item.id}`;
    const alreadyClaimed = await AsyncStorage.getItem(key);

    if (alreadyClaimed) return;

    // Belohnung geben
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

    return (
      <TouchableOpacity
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.item}>
          <Image
            source={{ uri: item.image }}
            style={styles.image}
            contentFit="contain"
          />
          <Text style={styles.itemText}>{item.title}</Text>
          {claimed && (
            <Text style={styles.claimed}>✅ Belohnung erhalten!</Text>
          )}
          {!claimed && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Halten für Belohnung: </Text>
              <FontAwesome5
                name="coins"
                size={14}
                color="#facc15"
                style={styles.icon}
              />
              <Text style={styles.tooltipText}> +100 </Text>
              <MaterialCommunityIcons
                name="cards-diamond"
                size={16}
                color="#38bdf8"
                style={styles.icon}
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

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_BG,
    paddingTop: 40,
  },
  header: {
    textAlign: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    fontWeight: "bold",
    fontSize: 25,
    color: BLUE_ACCENT,
    backgroundColor: `${BLUE_CARD}dd`,
    textShadowColor: "#334155",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    elevation: Platform.OS === "android" ? 2 : 0,
  },
  listContainer: {
    paddingHorizontal: 18,
    paddingBottom: 80,
  },
  item: {
    backgroundColor: BLUE_CARD,
    borderRadius: 18,
    marginBottom: 18,
    shadowColor: BLUE_SHADOW,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: Platform.OS === "android" ? 4 : 0,
    borderWidth: 2,
    borderColor: `${BLUE_BORDER}44`,
    padding: 10,
  },
  itemText: {
    fontSize: 17,
    fontWeight: "600",
    color: BLUE_TEXT,
    marginTop: 12,
    letterSpacing: 0.12,
  },
  image: {
    width: "100%",
    height: 165,
    borderRadius: 13,
    backgroundColor: "#172138",
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
    color: "#94a3b8",
  },

  icon: {
    marginHorizontal: 3,
    marginBottom: -1,
  },

  claimed: {
    marginTop: 6,
    color: "#10b981",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  description: {
    color: "#cbd5e1",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
});
