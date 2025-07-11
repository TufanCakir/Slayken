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

const getLabels = (item, isBuying) => {
  if (item.currency.includes("coin") && item.currency.includes("crystal")) {
    return {
      priceLabel: `${item.price} Coins / Kristalle`,
      buttonLabel: "Kaufen",
    };
  }
  if (item.currency.includes("coin")) {
    return { priceLabel: `${item.price} Coins`, buttonLabel: "Kaufen" };
  }
  if (item.currency.includes("crystal")) {
    return { priceLabel: `${item.price} Kristalle`, buttonLabel: "Kaufen" };
  }
  return { priceLabel: "", buttonLabel: "Kaufen" };
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
      method === "Coins" ? spendCoins(item.price) : spendCrystals(item.price);
      Alert.alert(
        "Kauf erfolgreich!",
        `Du hast ${item.name} für ${item.price} ${method} gekauft.`
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

      const can = {
        coin: item.currency.includes("coin") && coins >= item.price,
        crystal: item.currency.includes("crystal") && crystals >= item.price,
      };

      try {
        if (can.coin) await handleInternal(item, "Coins");
        else if (can.crystal) await handleInternal(item, "Kristalle");
        else {
          const deficit =
            can.coin === false && item.currency.includes("coin")
              ? `Du brauchst ${item.price - coins} weitere Coins.`
              : can.crystal === false && item.currency.includes("crystal")
              ? `Du brauchst ${item.price - crystals} weitere Kristalle.`
              : null;
          throw new Error(deficit || "Keine Zahlungsmethode verfügbar.");
        }
        if (typeof onUnlock === "function") await onUnlock(item);
      } catch (err) {
        Alert.alert("Kauf-Fehler", err.message || "Unbekannt");
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
              const { priceLabel, buttonLabel } = getLabels(
                item,
                isBuying && buyingItemId === item.id
              );
              return (
                <LinearGradient
                  colors={gradientColors}
                  start={{ x: 0.1, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardRow}
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
                    <Text style={styles.price}>{priceLabel}</Text>
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
                            <ActivityIndicator
                              color={styles.buttonText.color}
                            />
                          ) : (
                            <Text style={styles.buttonText}>{buttonLabel}</Text>
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
      <TabView
        navigationState={{ index: 0, routes }}
        renderScene={renderScene}
        onIndexChange={() => {}}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            style={{ backgroundColor: theme.accentColor }}
            indicatorStyle={{ backgroundColor: theme.textColor }}
            renderLabel={({ route, focused }) => (
              <Text
                style={{
                  color: focused ? theme.textColor : `${theme.textColor}99`,
                  fontWeight: "bold",
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
    price: {
      fontSize: 14,
      color: theme.textColor,
      textAlign: "center",
      marginBottom: 12,
    },
    buttonOuter: {
      borderRadius: 9,
      overflow: "hidden",
      marginTop: 10,
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
