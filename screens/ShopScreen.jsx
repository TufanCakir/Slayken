import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { useShop } from "../context/ShopContext";
import ScreenLayout from "../components/ScreenLayout";
import SHOP_ITEMS from "../data/shopData.json";

const { width: screenWidth } = Dimensions.get("window");

const getLabels = (item) => {
  if (item.currency.includes("coin") && item.currency.includes("crystal")) {
    return {
      priceLabel: `${item.price} Coins / Kristalle`,
      currency: "coinscrystals",
    };
  }
  if (item.currency.includes("coin")) {
    return { priceLabel: `${item.price} Coins`, currency: "coins" };
  }
  if (item.currency.includes("crystal")) {
    return { priceLabel: `${item.price} Kristalle`, currency: "crystals" };
  }
  return { priceLabel: "", currency: "" };
};

const getImageSource = (item, imageMap) =>
  item.skinImage ||
  item.charImage ||
  (item.characterId && imageMap?.[`class_${item.characterId}`]) ||
  require("../assets/logo.png");

// ---- Memoized Card -----
const ShopItemCard = React.memo(
  ({
    item,
    unlocked,
    priceLabel,
    currency,
    gradientColors,
    theme,
    isBuying,
    buyingItemId,
    onBuy,
    onUnlock,
    imageMap,
    styles,
  }) => {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardRow, unlocked && styles.cardRowUnlocked]}
      >
        <Image
          source={getImageSource(item, imageMap)}
          style={styles.iconImage}
          contentFit="contain"
        />
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          {item.category === "skin" && (
            <Text style={styles.skinFor}>Skin für: {item.characterId}</Text>
          )}
          {!unlocked && !!priceLabel && (
            <View
              style={[
                styles.priceBadge,
                currency === "crystals"
                  ? { backgroundColor: "#00b4d8cc" }
                  : currency === "coins"
                  ? { backgroundColor: "#e0a500cc" }
                  : { backgroundColor: theme.borderGlowColor + "c0" },
              ]}
            >
              <Text style={styles.price}>{priceLabel}</Text>
            </View>
          )}
          {!unlocked ? (
            <TouchableOpacity
              style={styles.buttonOuter}
              onPress={() => onBuy(item, onUnlock)}
              disabled={isBuying}
              activeOpacity={0.87}
            >
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0.25, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.button}
              >
                {isBuying && buyingItemId === item.id ? (
                  <ActivityIndicator color={theme.textColor} />
                ) : (
                  <Text style={styles.buttonText}>Kaufen</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0.1, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.unlockedBox}
            >
              <Text style={styles.unlockedText}>Freigeschaltet</Text>
            </LinearGradient>
          )}
        </View>
      </LinearGradient>
    );
  }
);

const usePurchaseFlow = (coins, crystals, spendCoins, spendCrystals) => {
  const [isBuying, setIsBuying] = useState(false);
  const [buyingItemId, setBuyingItemId] = useState(null);

  const finalize = useCallback(() => {
    setIsBuying(false);
    setBuyingItemId(null);
  }, []);

  const handleInternal = useCallback(
    async (item, method) => {
      if (method === "coins") await spendCoins(item.price);
      else await spendCrystals(item.price);

      Alert.alert(
        "Kauf erfolgreich!",
        `Du hast ${item.name} für ${item.price} ${
          method === "coins" ? "Coins" : "Kristalle"
        } gekauft.`
      );
    },
    [spendCoins, spendCrystals]
  );

  const handleBuy = useCallback(
    async (item, onUnlock) => {
      if (isBuying)
        return Alert.alert(
          "Wird verarbeitet",
          "Bitte warte auf den aktuellen Kauf."
        );
      setIsBuying(true);
      setBuyingItemId(item.id);

      const canBuyCoins = item.currency.includes("coin") && coins >= item.price;
      const canBuyCrystals =
        item.currency.includes("crystal") && crystals >= item.price;

      try {
        if (canBuyCoins) await handleInternal(item, "coins");
        else if (canBuyCrystals) await handleInternal(item, "crystals");
        else {
          let deficit = "";
          if (item.currency.includes("coin") && coins < item.price)
            deficit += `Du brauchst noch ${item.price - coins} Coins.\n`;
          if (item.currency.includes("crystal") && crystals < item.price)
            deficit += `Du brauchst noch ${item.price - crystals} Kristalle.\n`;
          throw new Error(deficit.trim() || "Nicht genug Währung.");
        }
        if (typeof onUnlock === "function") await onUnlock(item);
      } catch (err) {
        Alert.alert("Kauf-Fehler", err.message || "Unbekannter Fehler");
      }
      finalize();
    },
    [coins, crystals, handleInternal, isBuying, finalize]
  );

  return { isBuying, buyingItemId, handleBuy };
};

export default function ShopScreen() {
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { isUnlocked, unlockItem, loading } = useShop();

  const gradientColors = useMemo(
    () =>
      theme.linearGradient || [
        theme.accentColorSecondary,
        theme.accentColor,
        theme.accentColorDark,
      ],
    [theme]
  );

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isBuying, buyingItemId, handleBuy } = usePurchaseFlow(
    coins,
    crystals,
    spendCoins,
    spendCrystals
  );

  const categories = useMemo(
    () => Array.from(new Set(SHOP_ITEMS.map((i) => i.category))),
    []
  );
  const routes = useMemo(
    () =>
      categories.map((c) => ({
        key: c,
        title: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    [categories]
  );
  const [index, setIndex] = useState(0);

  // Memoisiertes RenderItem für FlatList
  const renderShopItem = useCallback(
    ({ item }) => {
      const unlocked = isUnlocked(item);
      const { priceLabel, currency } = getLabels(item);
      return (
        <ShopItemCard
          item={item}
          unlocked={unlocked}
          priceLabel={priceLabel}
          currency={currency}
          gradientColors={gradientColors}
          theme={theme}
          isBuying={isBuying}
          buyingItemId={buyingItemId}
          onBuy={handleBuy}
          onUnlock={unlockItem}
          imageMap={imageMap}
          styles={styles}
        />
      );
    },
    [
      isUnlocked,
      gradientColors,
      theme,
      isBuying,
      buyingItemId,
      handleBuy,
      unlockItem,
      imageMap,
      styles,
    ]
  );

  // Memoisiertes SceneMap (FlatList pro Kategorie)
  const renderScene = useMemo(
    () =>
      SceneMap(
        Object.fromEntries(
          routes.map((r) => [
            r.key,
            () => (
              <FlatList
                data={SHOP_ITEMS.filter((i) => i.category === r.key)}
                keyExtractor={(i) => i.id}
                contentContainerStyle={styles.list}
                renderItem={renderShopItem}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>Noch keine Angebote.</Text>
                }
              />
            ),
          ])
        )
      ),
    [routes, renderShopItem, styles.list, styles.emptyText]
  );

  if (loading) {
    return (
      <ScreenLayout style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.textColor} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={useCallback(
          (props) => (
            <TabBar
              {...props}
              scrollEnabled
              style={{ backgroundColor: theme.accentColor, borderRadius: 11 }}
              indicatorStyle={{
                backgroundColor: theme.textColor,
                height: 4,
                borderRadius: 3,
              }}
              renderLabel={({ route, focused }) => (
                <Text
                  style={{
                    color: focused ? theme.textColor : `${theme.textColor}99`,
                    fontWeight: focused ? "bold" : "500",
                    letterSpacing: 0.2,
                    fontSize: 15,
                  }}
                >
                  {route.title}
                </Text>
              )}
            />
          ),
          [theme]
        )}
      />
    </ScreenLayout>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    list: { padding: 20, paddingBottom: 40 },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
      backgroundColor: theme.accentColor + "ee",
      ...Platform.select({
        ios: { marginHorizontal: 3 },
        android: { marginHorizontal: 1 },
      }),
      // Schatten und Elevation entfernt
      minHeight: 120,
      overflow: "hidden",
    },
    cardRowUnlocked: {
      opacity: 0.52,
    },
    iconImage: { width: 100, height: 100, borderRadius: 22, marginRight: 18 },
    cardContent: { flex: 1, justifyContent: "center" },
    name: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      marginBottom: 4,
      // Textschatten entfernt
    },
    skinFor: {
      fontSize: 13,
      color: theme.borderGlowColor,
      marginBottom: 2,
      textAlign: "center",
    },
    priceBadge: {
      alignSelf: "center",
      marginBottom: 10,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 7,
      backgroundColor: theme.borderGlowColor + "c0",
      // Schatten entfernt
    },
    price: {
      fontSize: 14,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 0.18,
    },
    buttonOuter: {
      borderRadius: 9,
      overflow: "hidden",
      marginTop: 3,
      alignSelf: "center",
      minWidth: 120,
      // Schatten entfernt
    },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 9,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.12,
      // Textschatten entfernt
    },
    unlockedBox: {
      borderRadius: 9,
      paddingVertical: 7,
      paddingHorizontal: 20,
      marginTop: 10,
      alignSelf: "center",
      alignItems: "center",
      backgroundColor: theme.borderGlowColor + "22",
      // Schatten entfernt
    },
    unlockedText: {
      color: theme.borderGlowColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.1,
      textAlign: "center",
      // Textschatten entfernt
    },
    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: theme.textColor,
      opacity: 0.7,
    },
  });
