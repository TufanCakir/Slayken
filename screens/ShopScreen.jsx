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

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  const styles = useMemo(() => createStyles(theme), [theme]);
  const { isBuying, buyingItemId, handleBuy } = usePurchaseFlow(
    coins,
    crystals,
    spendCoins,
    spendCrystals
  );

  // TabView index state MUSS gehalten werden!
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

  // Eine Szene pro Kategorie
  const renderScene = SceneMap(
    Object.fromEntries(
      routes.map((r) => [
        r.key,
        () => (
          <FlatList
            data={SHOP_ITEMS.filter((i) => i.category === r.key)}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const unlocked = isUnlocked(item);
              const { priceLabel, currency } = getLabels(item);
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
                      <Text style={styles.skinFor}>
                        Skin für: {item.characterId}
                      </Text>
                    )}
                    {/* Preis-Badge */}
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
                    {/* Kaufen-Button oder Freigeschaltet */}
                    {!unlocked ? (
                      <TouchableOpacity
                        style={styles.buttonOuter}
                        onPress={() => handleBuy(item, unlockItem)}
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
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Noch keine Angebote.</Text>
            }
          />
        ),
      ])
    )
  );

  return (
    <ScreenLayout style={styles.container}>
      <View style={styles.balanceBar}>
        <Text style={styles.balanceText}>
          🪙 {coins} <Text style={{ color: "#00b4d8" }}>♦ {crystals}</Text>
        </Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
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
        )}
      />
    </ScreenLayout>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    balanceBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      paddingVertical: 11,
      paddingRight: 18,
      paddingLeft: 8,
      backgroundColor: theme.accentColorSecondary + "aa",
      borderBottomWidth: 1,
      borderBottomColor: theme.shadowColor + "33",
      marginBottom: 2,
      zIndex: 9,
    },
    balanceText: {
      fontSize: 16,
      color: theme.textColor,
      fontWeight: "700",
      letterSpacing: 0.1,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
    list: { padding: 20, paddingBottom: 40 },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 9,
      elevation: 5,
      overflow: "hidden",
      minHeight: 120,
      backgroundColor: theme.accentColor + "ee",
      ...Platform.select({
        ios: { marginHorizontal: 3 },
        android: { marginHorizontal: 1 },
      }),
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
      textShadowColor: theme.shadowColor,
      textShadowRadius: 3,
      textShadowOffset: { width: 0, height: 1 },
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
      shadowColor: theme.glowColor,
      shadowRadius: 6,
      shadowOpacity: 0.12,
      elevation: 2,
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
      shadowColor: theme.glowColor,
      shadowRadius: 8,
      shadowOpacity: 0.22,
      elevation: 2,
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
      textShadowColor: theme.shadowColor,
      textShadowRadius: 2,
    },
    unlockedBox: {
      borderRadius: 9,
      paddingVertical: 7,
      paddingHorizontal: 20,
      marginTop: 10,
      alignSelf: "center",
      alignItems: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 8,
      shadowOpacity: 0.17,
      elevation: 1,
      backgroundColor: theme.borderGlowColor + "22",
    },
    unlockedText: {
      color: theme.borderGlowColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.1,
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: theme.textColor,
      opacity: 0.7,
    },
  });
