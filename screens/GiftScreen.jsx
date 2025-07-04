import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
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
import { useAssets } from "../context/AssetsContext";

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  // Vorbereitete Gifts mit Bild-URLs
  const gifts = useMemo(() => {
    return giftData.map((gift) => {
      const typeImage =
        gift.type === "coins"
          ? "coin"
          : gift.type === "crystals"
          ? "crystal"
          : gift.type;
      return {
        ...gift,
        imageUrl: gift.type === "box" ? null : getItemImageUrl(typeImage),
      };
    });
  }, []);

  const remainingGifts = useMemo(
    () => gifts.filter((gift) => !collectedGifts[gift.id]),
    [gifts, collectedGifts]
  );

  const allCollected = remainingGifts.length === 0;

  const handleCollect = useCallback(
    async (gift) => {
      if (collectedGifts[gift.id]) return;
      await collectGift(gift.id);
      if (gift.type === "coins") addCoins(gift.amount || 0);
      if (gift.type === "crystals") addCrystals(gift.amount || 0);
      if (gift.type === "exp") addXp(gift.amount || 0);
    },
    [collectedGifts, collectGift, addCoins, addCrystals, addXp]
  );

  const collectAll = useCallback(async () => {
    const ids = remainingGifts.map((g) => g.id);
    if (ids.length === 0) return;

    await collectMultipleGifts(ids);
    for (const gift of remainingGifts) {
      if (gift.type === "coins") addCoins(gift.amount || 0);
      if (gift.type === "crystals") addCrystals(gift.amount || 0);
      if (gift.type === "exp") addXp(gift.amount || 0);
    }
  }, [remainingGifts, collectMultipleGifts, addCoins, addCrystals, addXp]);

  const renderItem = useCallback(
    ({ item }) => {
      const isCollected = collectedGifts[item.id];

      return (
        <TouchableOpacity
          style={[
            styles.giftItem,
            isCollected && styles.giftItemCollected,
            {
              borderColor: theme.borderGlowColor,
              shadowColor: theme.glowColor,
            },
          ]}
          activeOpacity={isCollected ? 1 : 0.85}
          onPress={() => !isCollected && handleCollect(item)}
          disabled={isCollected}
        >
          <View style={styles.iconWrapper}>
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
            style={[
              styles.giftName,
              isCollected && styles.giftNameCollected,
              { color: isCollected ? theme.borderGlowColor : theme.textColor },
            ]}
          >
            {isCollected ? "✓ " : ""}
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    },
    [collectedGifts, handleCollect, styles, theme]
  );

  const bgImage =
    typeof theme.bgImage === "string" ? { uri: theme.bgImage } : theme.bgImage;

  return (
    <ScreenLayout style={styles.flex}>
      {bgImage && (
        <Image
          source={bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={500}
          blurRadius={theme.bgBlur || 0}
        />
      )}
      <Text style={styles.header}>{t("giftsTitle")}</Text>

      <FlatList
        data={remainingGifts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t("noGifts")}</Text>}
        contentContainerStyle={styles.listContainer}
      />

      {!allCollected && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.glowButton}
            onPress={collectAll}
            activeOpacity={0.88}
          >
            <Text style={styles.glowButtonText}>{t("collectAll")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    header: {
      fontSize: 26,
      marginBottom: 16,
      textAlign: "center",
      letterSpacing: 0.6,
      marginTop: 20,
      paddingBottom: 9,
      alignSelf: "center",
      width: "81%",
      backgroundColor: theme.accentColor,
      borderRadius: 18,
      color: theme.textColor,
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    listContainer: {
      paddingBottom: 80,
      paddingHorizontal: 14,
    },
    giftItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 13,
      borderRadius: 14,
      marginBottom: 12,
      borderWidth: 2,
      backgroundColor: theme.accentColor,
      shadowOpacity: 0.13,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    giftItemCollected: {
      opacity: 0.4,
    },
    iconWrapper: {
      width: 54,
      height: 54,
      marginRight: 15,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 14,
      backgroundColor: theme.accentColor,
      borderWidth: 1,
      borderColor: theme.borderGlowColor,
    },
    giftIcon: {
      width: 45,
      height: 45,
      borderRadius: 10,
    },
    giftName: {
      fontSize: 18,
      flex: 1,
      letterSpacing: 0.28,
      fontWeight: "600",
    },
    giftNameCollected: {
      opacity: 0.7,
    },
    buttonGroup: {
      marginVertical: 18,
      paddingHorizontal: 16,
      position: "absolute",
      bottom: 88,
      width: "100%",
      alignItems: "center",
    },
    glowButton: {
      backgroundColor: theme.accentColor,
      borderRadius: 16,
      paddingVertical: 15,
      paddingHorizontal: 40,
      alignItems: "center",
      borderWidth: 2,
      borderColor: theme.borderGlowColor,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 3,
    },
    glowButtonText: {
      fontSize: 18,
      letterSpacing: 0.28,
      color: theme.textColor,
      fontWeight: "700",
    },
    empty: {
      textAlign: "center",
      marginTop: 38,
      fontSize: 19,
      color: theme.textColor,
      opacity: 0.85,
      fontWeight: "600",
    },
  });
}
