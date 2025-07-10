import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import * as InAppPurchases from "expo-in-app-purchases";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { useShop } from "../context/ShopContext";
import ScreenLayout from "../components/ScreenLayout";
import SHOP_ITEMS from "../data/shopData.json";

const { width: screenWidth } = Dimensions.get("window");

// --- Helper ---
const getImageSource = (item, imageMap) =>
  item.skinImage ||
  item.charImage ||
  (item.characterId && imageMap?.[`class_${item.characterId}`]) ||
  require("../assets/logo.png");

const getLabels = (item, iapProducts, isBuying) => {
  if (item.currency.includes("iap") && item.iapId) {
    const prod = iapProducts?.find((p) => p.productId === item.iapId);
    const price = prod?.price ?? "Echtgeld";
    return {
      priceLabel: price,
      buttonLabel: isBuying ? "Wird gekauft..." : `Für ${price} kaufen`,
    };
  }
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

// --- ShopItemCard ---
function ShopItemCard({
  item,
  iapProducts,
  imageMap,
  isBuying,
  onBuy,
  isUnlocked,
  styles,
  buyingItemId,
}) {
  const { priceLabel, buttonLabel } = getLabels(
    item,
    iapProducts,
    isBuying && buyingItemId === item.id
  );
  const unlocked = isUnlocked(item);

  return (
    <View style={styles.cardRow}>
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
        <Text style={styles.price}>{priceLabel}</Text>
        {unlocked ? (
          <Text style={[styles.price, { color: "#62dc59" }]}>
            Freigeschaltet
          </Text>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              isBuying && buyingItemId === item.id && { opacity: 0.7 },
            ]}
            onPress={() => onBuy(item, iapProducts)}
            disabled={isBuying && buyingItemId === item.id}
          >
            {isBuying && buyingItemId === item.id ? (
              <ActivityIndicator color={styles.buttonText.color} />
            ) : (
              <Text style={styles.buttonText}>{buttonLabel}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// --- Kauf-Flow Hook ---
function usePurchaseFlow({
  coins,
  crystals,
  spendCoins,
  spendCrystals,
  unlock,
}) {
  const [isBuying, setIsBuying] = useState(false);
  const [buyingItemId, setBuyingItemId] = useState(null);

  const finalize = useCallback(() => {
    setIsBuying(false);
    setBuyingItemId(null);
  }, []);

  const handleInternal = useCallback(
    async (item, method) => {
      if (method === "Coins") await spendCoins(item.price);
      else if (method === "Kristalle") await spendCrystals(item.price);
      await unlock(item);
      Alert.alert(
        "Kauf erfolgreich!",
        `Du hast ${item.name} für ${item.price} ${method} gekauft.`
      );
    },
    [spendCoins, spendCrystals, unlock]
  );

  const handleBuy = useCallback(
    async (item, iapProducts) => {
      if (isBuying) return;
      setIsBuying(true);
      setBuyingItemId(item.id);

      const can = {
        coin: item.currency.includes("coin") && coins >= item.price,
        crystal: item.currency.includes("crystal") && crystals >= item.price,
        iap: item.currency.includes("iap") && item.iapId,
      };

      try {
        if (can.coin) {
          await handleInternal(item, "Coins");
          finalize();
        } else if (can.crystal) {
          await handleInternal(item, "Kristalle");
          finalize();
        } else if (can.iap) {
          await InAppPurchases.purchaseItemAsync(item.iapId);
          // finalize erst im IAP Listener!
        } else {
          const deficit =
            can.coin === false && item.currency.includes("coin")
              ? `Du brauchst ${item.price - coins} weitere Coins.`
              : can.crystal === false && item.currency.includes("crystal")
              ? `Du brauchst ${item.price - crystals} weitere Kristalle.`
              : "Keine gültige Zahlungsmethode verfügbar.";
          throw new Error(deficit);
        }
      } catch (err) {
        Alert.alert("Kauf-Fehler", err.message || "Unbekannt");
        finalize();
      }
    },
    [coins, crystals, handleInternal, isBuying, finalize]
  );

  return { isBuying, buyingItemId, handleBuy, finalize };
}

// --- Hauptkomponente ---
export default function ShopScreen() {
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const { isUnlocked, unlock } = useShop();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { isBuying, buyingItemId, handleBuy, finalize } = usePurchaseFlow({
    coins,
    crystals,
    spendCoins,
    spendCrystals,
    unlock,
  });

  const [iapProducts, setIapProducts] = useState([]);
  const [iapLoading, setIapLoading] = useState(false);
  const hasIAP = useMemo(
    () => SHOP_ITEMS.some((i) => i.currency.includes("iap")),
    []
  );

  // IAP Listener
  useEffect(() => {
    const subscription = InAppPurchases.setPurchaseListener(
      async ({ responseCode, results, errorCode, errorText }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK) {
          for (const purchase of results) {
            if (!purchase.acknowledged) {
              const item = SHOP_ITEMS.find(
                (s) => s.iapId === purchase.productId
              );
              if (item) {
                await unlock(item);
                Alert.alert("Kauf erfolgreich", `${item.name} freigeschaltet!`);
              }
              await InAppPurchases.finishTransactionAsync(purchase, false);
            }
          }
          finalize();
        } else if (
          responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED
        ) {
          Alert.alert("Kauf abgebrochen", "Du hast den Kauf abgebrochen.");
          finalize();
        } else if (errorCode) {
          Alert.alert("Kauf-Fehler", errorText || errorCode.toString());
          finalize();
        } else {
          finalize();
        }
      }
    );
    return () => {
      subscription.remove?.();
      InAppPurchases.disconnectAsync();
    };
  }, [finalize, unlock]);

  useEffect(() => {
    if (!hasIAP) return;
    setIapLoading(true);
    InAppPurchases.connectAsync()
      .then(() => {
        const ids = SHOP_ITEMS.filter((i) => i.iapId).map((i) => i.iapId);
        return InAppPurchases.getProductsAsync(ids);
      })
      .then(({ responseCode, results }) => {
        if (responseCode === InAppPurchases.IAPResponseCode.OK)
          setIapProducts(results);
      })
      .catch(() =>
        Alert.alert("Shop-Fehler", "IAP-Produkte konnten nicht geladen werden.")
      )
      .finally(() => setIapLoading(false));
  }, [hasIAP]);

  const categories = useMemo(
    () => [...new Set(SHOP_ITEMS.map((i) => i.category))],
    []
  );
  const [tabIndex, setTabIndex] = useState(0);
  const routes = useMemo(
    () =>
      categories.map((c) => ({
        key: c,
        title: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      })),
    [categories]
  );

  const renderScene = SceneMap(
    Object.fromEntries(
      routes.map((r) => [
        r.key,
        () => (
          <FlatList
            data={SHOP_ITEMS.filter((i) => i.category === r.key)}
            keyExtractor={(i) => i.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ShopItemCard
                item={item}
                iapProducts={iapProducts}
                imageMap={imageMap}
                isBuying={isBuying}
                onBuy={handleBuy}
                isUnlocked={isUnlocked}
                styles={styles}
                buyingItemId={buyingItemId}
              />
            )}
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
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
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
      {(isBuying || iapLoading) && (
        <View style={styles.buyingOverlay}>
          <ActivityIndicator size="large" color={theme.textColor} />
          <Text style={{ color: theme.textColor, marginTop: 12 }}>
            {iapLoading ? "Produkte werden geladen..." : "Wird verarbeitet ..."}
          </Text>
        </View>
      )}
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
      backgroundColor: theme.accentColor,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
    },
    iconImage: { width: 100, height: 100, borderRadius: 22, marginRight: 18 },
    cardContent: { flex: 1, justifyContent: "center" },
    name: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      marginBottom: 4,
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
    button: {
      borderColor: theme.textColor,
      borderWidth: 1,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 24,
      alignSelf: "center",
      marginTop: 10,
      backgroundColor: theme.buttonColor || "transparent",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      color: theme.textColor,
      fontWeight: "bold",
      fontSize: 15,
      letterSpacing: 0.12,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 50,
      color: theme.textColor,
      opacity: 0.7,
    },
    buyingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#000C",
      zIndex: 1000,
    },
  });
