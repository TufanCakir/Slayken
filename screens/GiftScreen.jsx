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

const ICON_TYPE_MAP = {
  coins: "coin1",
  crystals: "crystal1",
  "exp-potion": "exp-potion",
  exp: "exp",
  // mehr Typen bei Bedarf!
};

// --- Gift-Card Komponente ---
function GiftCard({ item, collected, onCollect, theme, imageMap }) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={[
        styles.giftItem,
        collected && styles.giftItemCollected,
        { borderColor: theme.borderGlowColor, shadowColor: theme.glowColor },
      ]}
      activeOpacity={collected ? 1 : 0.86}
      onPress={collected ? undefined : () => onCollect(item)}
      disabled={collected}
      accessibilityRole="button"
      accessibilityLabel={collected ? t("collected") : t("collectGift")}
    >
      <View style={styles.iconWrapper}>
        <Image
          source={item.imageUrl}
          style={styles.giftIcon}
          contentFit="contain"
          transition={220}
        />
      </View>
      <Text
        style={[
          styles.giftName,
          collected && styles.giftNameCollected,
          {
            color: collected ? theme.borderGlowColor : theme.textColor,
            textShadowColor: collected
              ? theme.glowColor
              : theme.borderGlowColor,
            textShadowRadius: 7,
          },
        ]}
      >
        {collected ? "✓ " : ""}
        {item.name}
      </Text>
    </TouchableOpacity>
  );
}

export default function GiftScreen() {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const { addCoins } = useCoins();
  const { addCrystals } = useCrystals();
  const { addXp } = useAccountLevel();
  const { addPotion } = useInventory();
  const { collectedGifts, collectGift, collectMultipleGifts } = useGifts();

  // Gifts vorbereiten (memoisiert, inkl. Bild)
  const gifts = useMemo(
    () =>
      giftData.map((gift) => ({
        ...gift,
        imageUrl: getItemImageUrl(ICON_TYPE_MAP[gift.type] || gift.type),
      })),
    []
  );

  const remainingGifts = useMemo(
    () => gifts.filter((gift) => !collectedGifts[gift.id]),
    [gifts, collectedGifts]
  );
  const allCollected = remainingGifts.length === 0;

  // Belohnung anwenden
  const applyReward = useCallback(
    (gift) => {
      if (gift.type === "coins") addCoins(gift.amount || 0);
      if (gift.type === "crystals") addCrystals(gift.amount || 0);
      if (gift.type === "exp") addXp(gift.amount || 0);
      if (gift.type === "exp-potion") addPotion(gift.amount || 1);
      // weitere Typen ergänzen!
    },
    [addCoins, addCrystals, addXp, addPotion]
  );

  // Einzelnes Geschenk einsammeln
  const handleCollect = useCallback(
    async (gift) => {
      if (collectedGifts[gift.id]) return;
      await collectGift(gift.id);
      applyReward(gift);
    },
    [collectedGifts, collectGift, applyReward]
  );

  // Alle einsammeln
  const collectAll = useCallback(async () => {
    const ids = remainingGifts.map((g) => g.id);
    if (!ids.length) return;
    await collectMultipleGifts(ids);
    remainingGifts.forEach(applyReward);
  }, [remainingGifts, collectMultipleGifts, applyReward]);

  const bgImage =
    typeof theme.bgImage === "string" ? { uri: theme.bgImage } : theme.bgImage;

  return (
    <ScreenLayout style={styles.flex}>
      {bgImage && (
        <Image
          source={bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
          blurRadius={theme.bgBlur || 0}
        />
      )}
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
        data={gifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GiftCard
            item={item}
            collected={!!collectedGifts[item.id]}
            onCollect={handleCollect}
            theme={theme}
            imageMap={imageMap}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>{t("noGifts")}</Text>}
        contentContainerStyle={styles.listContainer}
      />

      {!allCollected && (
        <View style={styles.buttonGroup}>
          <GlowButton
            onPress={collectAll}
            theme={theme}
            label={t("collectAll")}
          />
        </View>
      )}
    </ScreenLayout>
  );
}

// --- GlowButton als eigene Komponente für Wiederverwendbarkeit ---
function GlowButton({ onPress, label, theme }) {
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={styles.glowButtonOuter}
      onPress={onPress}
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
        <Text style={styles.glowButtonText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
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
      shadowColor: theme.glowColor,
      shadowRadius: 14,
      shadowOpacity: 0.33,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    header: {
      fontSize: 26,
      textAlign: "center",
      letterSpacing: 0.9,
      color: theme.textColor,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 10,
      textShadowOffset: { width: 0, height: 3 },
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
      shadowOpacity: 0.13,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
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
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
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
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.23,
      elevation: 5,
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
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    empty: {
      textAlign: "center",
      marginTop: 38,
      fontSize: 19,
      color: theme.textColor,
      opacity: 0.85,
      fontWeight: "700",
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
  });
}
