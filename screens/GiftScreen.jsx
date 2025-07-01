import { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "../components/ScreenLayout";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useAccountLevel } from "../context/AccountLevelContext";
import { useGifts } from "../context/GiftContext";
import GiftBox from "../components/GiftBox";
import giftData from "../data/giftData.json";
import { t } from "../i18n";
import { useThemeContext } from "../context/ThemeContext";
import { getItemImageUrl } from "../utils/item/itemUtils";

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  const [refreshFlag, setRefreshFlag] = useState(false);

  const gifts = useMemo(
    () =>
      giftData.map((gift) => {
        let imageUrl = "";
        switch (gift.type) {
          case "coins":
            imageUrl = getItemImageUrl("coin");
            break;
          case "crystals":
            imageUrl = getItemImageUrl("crystal");
            break;
          case "exp":
            imageUrl = getItemImageUrl("exp");
            break;
          case "box":
            imageUrl = null;
            break;
          default:
            imageUrl = getItemImageUrl("coin");
        }
        return { ...gift, imageUrl };
      }),
    [theme]
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
    const isCollected = collectedGifts[item.id];
    return (
      <TouchableOpacity
        style={[styles.giftItem, isCollected && styles.giftItemCollected]}
        activeOpacity={isCollected ? 1 : 0.8}
        onPress={() => !isCollected && handleCollect(item)}
        disabled={isCollected}
      >
        <View
          style={[
            styles.iconWrapper,
            isCollected && styles.iconWrapperCollected,
          ]}
        >
          {item.type === "box" ? (
            <GiftBox />
          ) : (
            <Image
              source={item.imageUrl}
              style={styles.giftIcon}
              contentFit="contain"
              transition={300}
            />
          )}
        </View>
        <Text
          style={[styles.giftName, isCollected && styles.giftNameCollected]}
        >
          {isCollected ? "✓ " : ""}
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={styles.flex}>
      <Text style={styles.header}>{t("giftsTitle")}</Text>
      <FlatList
        data={remainingGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t("noGifts")}</Text>}
        contentContainerStyle={styles.listContainer}
        extraData={refreshFlag}
      />

      {!allCollected && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.glowButton}
            onPress={collectAll}
            activeOpacity={0.87}
          >
            <Text style={styles.glowButtonText}>{t("collectAll")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenLayout>
  );
}

function createStyles(theme) {
  const glow = theme.shadowColor || "#ff8800";
  const borderGlow = theme.borderColor || "#ff5500";
  const accent = theme.accentColor || "#191919";
  const textGlow = theme.textColor || "#fff";

  return StyleSheet.create({
    flex: { flex: 1 },
    header: {
      fontSize: 27,
      fontWeight: "bold",
      marginBottom: 14,
      textAlign: "center",
      color: textGlow,
      letterSpacing: 0.7,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 10,
      marginTop: 15,
      borderBottomWidth: 2,
      borderColor: borderGlow,
      paddingBottom: 7,
      alignSelf: "center",
      width: "80%",
      backgroundColor: accent + "ee",
      borderRadius: 18,
      shadowColor: glow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.13,
      shadowRadius: 10,
      elevation: 5,
    },
    listContainer: {
      paddingBottom: 80,
      zIndex: 2,
      paddingHorizontal: 14,
    },
    giftItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      paddingHorizontal: 12,
      borderBottomWidth: 1.5,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: borderGlow,
      backgroundColor: accent,
      ...Platform.select({
        ios: {
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.24,
          shadowRadius: 14,
        },
        android: { elevation: 8 },
      }),
      shadowColor: glow,
      zIndex: 2,
      opacity: 1,
    },
    giftItemCollected: {
      backgroundColor: accent + "ee",
      borderColor: "#3337",
      shadowColor: "#0000",
      opacity: 0.45,
    },
    iconWrapper: {
      width: 56,
      height: 56,
      marginRight: 17,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: borderGlow,
      backgroundColor: accent,
      shadowColor: glow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 9,
      elevation: 5,
    },
    iconWrapperCollected: {
      borderColor: "#3337",
      shadowColor: "#0000",
      backgroundColor: accent + "ee",
    },
    giftIcon: {
      width: 46,
      height: 46,
      borderRadius: 10,
    },
    giftName: {
      fontSize: 19,
      fontWeight: "700",
      flex: 1,
      letterSpacing: 0.3,
      textShadowColor: glow,
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
      color: textGlow,
      opacity: 1,
    },
    giftNameCollected: {
      color: "#8e9299",
      opacity: 0.9,
    },
    buttonGroup: {
      marginVertical: 20,
      paddingHorizontal: 18,
      gap: 12,
      position: "absolute",
      bottom: 95,
      width: "100%",
      alignItems: "center",
    },
    glowButton: {
      backgroundColor: accent,
      borderRadius: 18,
      paddingVertical: 18,
      paddingHorizontal: 44,
      alignItems: "center",
      shadowColor: glow,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.32,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 2.5,
      borderColor: borderGlow,
    },
    glowButtonText: {
      color: textGlow,
      fontWeight: "bold",
      fontSize: 19,
      letterSpacing: 0.3,
    },
    empty: {
      textAlign: "center",
      marginTop: 34,
      fontSize: 18,
      color: textGlow,
      zIndex: 2,
    },
  });
}
