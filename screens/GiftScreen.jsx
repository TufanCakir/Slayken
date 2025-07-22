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
import giftData from "../data/giftData.json";
import { t } from "../i18n";
import { useThemeContext } from "../context/ThemeContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { useAssets } from "../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";
import { useInventory } from "../context/InventoryContext";

// --- Memoized GiftItem ---
const GiftItem = React.memo(function GiftItem({
  item,
  isCollected,
  theme,
  styles,
  onCollect,
}) {
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
      onPress={() => !isCollected && onCollect(item)}
      disabled={isCollected}
    >
      <View style={styles.iconWrapper}>
        <Image
          source={item.imageUrl}
          style={styles.giftIcon}
          contentFit="contain"
          transition={300}
        />
      </View>
      <Text
        style={[
          styles.giftName,
          isCollected && styles.giftNameCollected,
          {
            color: isCollected ? theme.borderGlowColor : theme.textColor,
            textShadowColor: isCollected
              ? theme.glowColor
              : theme.borderGlowColor,
            textShadowRadius: 7,
          },
        ]}
      >
        {isCollected ? "✓ " : ""}
        {item.name}
      </Text>
    </TouchableOpacity>
  );
});

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { addPotion } = useInventory();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  // Typen-Mapping, damit alles eindeutig ist!
  const ICON_TYPE_MAP = useMemo(
    () => ({
      coins: "coin1",
      crystals: "crystal1",
      "exp-potion": "exp-potion",
      exp: "exp",
      // weitere Typen einfach ergänzen!
    }),
    []
  );

  // Gifts vorbereiten und Memoisieren (nutzt das Mapping!)
  const gifts = useMemo(
    () =>
      giftData.map((gift) => ({
        ...gift,
        imageUrl: getItemImageUrl(ICON_TYPE_MAP[gift.type] || gift.type),
      })),
    [ICON_TYPE_MAP]
  );

  const remainingGifts = useMemo(
    () => gifts.filter((gift) => !collectedGifts[gift.id]),
    [gifts, collectedGifts]
  );

  const allCollected = remainingGifts.length === 0;

  // Hilfsfunktion für Belohnung
  const applyReward = useCallback(
    (gift) => {
      if (gift.type === "coins") addCoins(gift.amount || 0);
      if (gift.type === "crystals") addCrystals(gift.amount || 0);
      if (gift.type === "exp") addXp(gift.amount || 0);
      if (gift.type === "exp-potion") addPotion(gift.amount || 1);
      // weitere Typen bei Bedarf ergänzen!
    },
    [addCoins, addCrystals, addXp, addPotion]
  );

  const handleCollect = useCallback(
    async (gift) => {
      if (collectedGifts[gift.id]) return;
      await collectGift(gift.id);
      applyReward(gift);
    },
    [collectedGifts, collectGift, applyReward]
  );

  const collectAll = useCallback(async () => {
    const ids = remainingGifts.map((g) => g.id);
    if (ids.length === 0) return;
    await collectMultipleGifts(ids);
    remainingGifts.forEach(applyReward);
  }, [remainingGifts, collectMultipleGifts, applyReward]);

  // RenderItem Memoized Callback
  const renderItem = useCallback(
    ({ item }) => (
      <GiftItem
        item={item}
        isCollected={!!collectedGifts[item.id]}
        theme={theme}
        styles={styles}
        onCollect={handleCollect}
      />
    ),
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
      {/* Gradient-Header */}
      <LinearGradient
        colors={[
          theme.accentColorSecondary,
          theme.accentColor,
          theme.accentColorDark,
        ]}
        start={[0, 0]}
        end={[1, 0]}
        style={styles.headerGradient}
      >
        <Text style={styles.header}>{t("giftsTitle")}</Text>
      </LinearGradient>

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
            style={styles.glowButtonOuter}
            onPress={collectAll}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[
                theme.accentColorSecondary,
                theme.accentColor,
                theme.accentColorDark,
              ]}
              start={[0.1, 0]}
              end={[1, 1]}
              style={styles.glowButton}
            >
              <Text style={styles.glowButtonText}>{t("collectAll")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ScreenLayout>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    headerGradient: {
      borderRadius: 16,
      marginTop: 20,
      marginBottom: 16,
      alignSelf: "center",
      width: "83%",
      paddingVertical: 13,
      paddingHorizontal: 8,
    },
    header: {
      fontSize: 26,
      textAlign: "center",
      letterSpacing: 0.9,
      color: theme.textColor,
      fontWeight: "bold",
      textTransform: "uppercase",
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
      borderColor: theme.borderGlowColor,
    },
    giftItemCollected: {
      opacity: 0.47,
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
      fontWeight: "700",
      color: theme.textColor,
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
    glowButtonOuter: {
      borderRadius: 16,
      overflow: "hidden",
      width: "70%",
      alignSelf: "center",
    },
    glowButton: {
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: "center",
      width: "100%",
      justifyContent: "center",
    },
    glowButtonText: {
      fontSize: 18,
      letterSpacing: 0.36,
      color: theme.textColor,
      fontWeight: "bold",
    },
    empty: {
      textAlign: "center",
      marginTop: 38,
      fontSize: 19,
      color: theme.textColor,
      opacity: 0.85,
      fontWeight: "700",
    },
  });
}
