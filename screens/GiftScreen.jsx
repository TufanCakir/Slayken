import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Button,
} from "react-native";
import {
  FontAwesome,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import ScreenLayout from "../components/ScreenLayout";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useGifts } from "../context/GiftContext";
import GiftBox from "../components/GiftBox";
import giftData from "../data/giftData.json";
import { t } from "../i18n";

// BLUE-THEME COLORS
const BLUE_BG = "#0f172a";
const BLUE_CARD = "#1e293b";
const BLUE_BORDER = "#2563eb";
const BLUE_SHADOW = "#60a5fa";
const BLUE_ACCENT = "#38bdf8";
const BLUE_TEXT = "#f0f9ff";
const BLUE_MUTED = "#a7c7e7";
const BLUE_DISABLED = "#64748b";

export default function GiftScreen() {
  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  const [refreshFlag, setRefreshFlag] = useState(false);

  const gifts = useMemo(
    () =>
      giftData.map((gift) => {
        let icon;
        switch (gift.type) {
          case "coins":
            icon = () => (
              <FontAwesome5 name="coins" size={50} color={BLUE_ACCENT} />
            );
            break;
          case "crystals":
            icon = () => (
              <MaterialCommunityIcons
                name="cards-diamond"
                size={50}
                color="#1E90FF"
              />
            );
            break;
          case "exp":
            icon = () => <FontAwesome5 name="fire" size={50} color="#fbbf24" />;
            break;
          case "box":
            icon = GiftBox;
            break;
          default:
            icon = () => (
              <FontAwesome name="gift" size={50} color={BLUE_MUTED} />
            );
        }
        return { ...gift, icon };
      }),
    []
  );

  const remainingGifts = gifts.filter((gift) => !collectedGifts[gift.id]);
  const allCollected = remainingGifts.length === 0;

  const handleCollect = async (item) => {
    if (collectedGifts[item.id]) return;

    await collectGift(item.id);
    if (item.type === "coins" && item.amount) addCoins(item.amount);
    if (item.type === "crystals" && item.amount) addCrystals(item.amount);
    if (item.type === "exp" && item.amount) addXp(item.amount);
    setRefreshFlag((prev) => !prev);
  };

  const collectAll = async () => {
    const idsToCollect = remainingGifts.map((gift) => gift.id);
    await collectMultipleGifts(idsToCollect);

    for (const gift of remainingGifts) {
      if (gift.type === "coins" && gift.amount) addCoins(gift.amount);
      if (gift.type === "crystals" && gift.amount) addCrystals(gift.amount);
      if (gift.type === "exp" && gift.amount) addXp(gift.amount);
    }
    setRefreshFlag((prev) => !prev);
  };

  const renderItem = ({ item }) => {
    const Icon = item.icon;
    const isCollected = collectedGifts[item.id];

    return (
      <TouchableOpacity
        style={[
          styles.giftItem,
          {
            borderColor: BLUE_BORDER,
            backgroundColor: isCollected ? `${BLUE_DISABLED}44` : BLUE_CARD,
            shadowColor: isCollected ? "#0000" : BLUE_SHADOW,
          },
        ]}
        activeOpacity={isCollected ? 1 : 0.8}
        onPress={() => !isCollected && handleCollect(item)}
        disabled={isCollected}
      >
        <View style={styles.iconWrapper}>
          <Icon size={50} color={isCollected ? BLUE_MUTED : BLUE_ACCENT} />
        </View>
        <Text
          style={[
            styles.giftName,
            {
              color: isCollected ? BLUE_MUTED : BLUE_TEXT,
              backgroundColor: "transparent",
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
    <ScreenLayout style={{ flex: 1, backgroundColor: BLUE_BG }}>
      <View style={StyleSheet.absoluteFill} />

      <Text style={styles.header}>{t("giftsTitle")}</Text>

      <FlatList
        data={remainingGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t("noGifts")}</Text>}
        contentContainerStyle={styles.listContainer}
        extraData={refreshFlag}
      />

      <View style={styles.buttonGroup}>
        {!allCollected && (
          <TouchableOpacity
            style={styles.blueButton}
            onPress={collectAll}
            activeOpacity={0.87}
          >
            <Text style={styles.blueButtonText}>{t("collectAll")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: BLUE_ACCENT,
    letterSpacing: 0.5,
    textShadowColor: "#334155",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    zIndex: 2,
    marginTop: 10,
  },
  listContainer: {
    paddingBottom: 80,
    zIndex: 2,
    paddingHorizontal: 10,
  },
  giftItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: BLUE_CARD,
    borderColor: BLUE_BORDER,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
    zIndex: 2,
  },
  iconWrapper: {
    width: 54,
    height: 54,
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  giftName: {
    fontSize: 19,
    fontWeight: "600",
    flex: 1,
    color: BLUE_TEXT,
    letterSpacing: 0.2,
  },
  buttonGroup: {
    marginVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    position: "absolute",
    bottom: 95,
    width: "100%",
    alignItems: "center",
  },
  blueButton: {
    backgroundColor: BLUE_ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 34,
    alignItems: "center",
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.19,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: BLUE_BORDER,
  },
  blueButtonText: {
    color: BLUE_BG,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.18,
  },
  empty: {
    textAlign: "center",
    marginTop: 34,
    fontSize: 17,
    color: BLUE_MUTED,
    zIndex: 2,
  },
});
