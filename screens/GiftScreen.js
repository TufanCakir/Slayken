// Datei: screens/GiftScreen.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import { useThemeContext } from "../context/ThemeContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import GiftBox from "../components/GiftBox";
import StarGift from "../components/StarGift";
import giftData from "../data/giftData.json";
import { useAccountLevel } from "../context/AccountLevelContext";
import { t } from "../i18n"; // ← Übersetzungsfunktion importieren

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const [collected, setCollected] = useState({});
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();

  const gifts = giftData.map((gift) => {
    let icon;
    switch (gift.type) {
      case "coins":
        icon = () => <FontAwesome name="viacoin" size={50} color="#FFD700" />;
        break;
      case "crystals":
        icon = () => <FontAwesome5 name="gem" size={50} color="#00FFFF" />;
        break;
      case "exp":
        icon = () => <FontAwesome5 name="fire" size={50} color="#FF5733" />;
        break;
      case "box":
        icon = GiftBox;
        break;
      case "star":
        icon = StarGift;
        break;
      default:
        icon = () => <FontAwesome name="gift" size={50} color="#aaa" />;
    }
    return { ...gift, icon };
  });

  const remainingGifts = gifts.filter((gift) => !collected[gift.id]);
  const allCollected = remainingGifts.length === 0;

  useEffect(() => {
    const loadCollected = async () => {
      try {
        const json = await AsyncStorage.getItem("collectedGifts");
        if (json) setCollected(JSON.parse(json));
      } catch (e) {
        console.warn("Fehler beim Laden der eingesammelten Geschenke", e);
      }
    };
    loadCollected();
  }, []);

  const handleCollect = async (item) => {
    if (collected[item.id]) return;

    const newCollected = { ...collected, [item.id]: true };
    setCollected(newCollected);
    await AsyncStorage.setItem("collectedGifts", JSON.stringify(newCollected));

    if (item.type === "coins" && item.amount) addCoins(item.amount);
    if (item.type === "crystals" && item.amount) addCrystals(item.amount);
    if (item.type === "exp" && item.amount) addXp(item.amount);
  };

  const collectAll = async () => {
    const newCollected = { ...collected };

    for (const gift of gifts) {
      if (!collected[gift.id]) {
        newCollected[gift.id] = true;

        if (gift.type === "coins" && gift.amount) addCoins(gift.amount);
        if (gift.type === "crystals" && gift.amount) addCrystals(gift.amount);
        if (gift.type === "exp" && gift.amount) addXp(gift.amount);
      }
    }

    setCollected(newCollected);
    await AsyncStorage.setItem("collectedGifts", JSON.stringify(newCollected));
  };

  const renderItem = ({ item }) => {
    const Icon = item.icon;
    const isCollected = collected[item.id];

    return (
      <TouchableOpacity
        style={[
          styles.giftItem,
          {
            borderColor: theme.shadowColor,
            backgroundColor: isCollected ? "#88888866" : theme.accentColor,
            shadowColor: theme.shadowColor,
          },
        ]}
        activeOpacity={isCollected ? 1 : 0.8}
        onPress={() => !isCollected && handleCollect(item)}
        disabled={isCollected}
      >
        <View style={styles.iconWrapper}>
          <Icon size={50} color={isCollected ? "#ccc" : undefined} />
        </View>
        <Text
          style={[
            styles.giftName,
            {
              color: isCollected ? "#ccc" : theme.textColor,
              backgroundColor: isCollected ? "#00000010" : theme.accentColor,
            },
          ]}
        >
          {isCollected ? "✓ " : ""}
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      <View style={StyleSheet.absoluteFill} />

      <Text
        style={[
          styles.header,
          { color: theme.textColor, backgroundColor: theme.accentColor },
        ]}
      >
        {t("giftsTitle")} {/* z. B. "Geschenke" / "Gifts" */}
      </Text>

      <FlatList
        data={remainingGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text
            style={[
              styles.empty,
              { color: theme.textColor, backgroundColor: theme.accentColor },
            ]}
          >
            {t("noGifts")}{" "}
            {/* z. B. "Keine Geschenke verfügbar" / "No gifts available" */}
          </Text>
        }
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.buttonGroup}>
        {!allCollected && (
          <Button
            title={t(
              "collectAll"
            )} /* z. B. "Alle einsammeln" / "Collect All" */
            onPress={collectAll}
            color={Platform.OS === "ios" ? theme.textColor : undefined}
          />
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    zIndex: 2,
  },
  listContainer: { paddingBottom: 80, zIndex: 2 },
  giftItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
    zIndex: 2,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  giftName: { fontSize: 18, fontWeight: "500", flex: 1 },
  buttonGroup: {
    marginVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    position: "absolute",
    bottom: 100,
    width: "100%",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    zIndex: 2,
  },
});
