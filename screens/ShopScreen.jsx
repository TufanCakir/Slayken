import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Image } from "expo-image";
import Purchases from "react-native-purchases";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import ScreenLayout from "../components/ScreenLayout";
import SHOP_ITEMS from "../data/shopData.json";
import Constants from "expo-constants";

const { width: screenWidth } = Dimensions.get("window");

const getPriceLabel = (item, rcProducts) => {
  if (item.currency.includes("coin") && item.currency.includes("crystal")) {
    return `${item.price} Coins/Kristalle`;
  }
  if (item.currency.includes("coin")) return `${item.price} Coins`;
  if (item.currency.includes("crystal")) return `${item.price} Kristalle`;
  if (item.currency.includes("iap") && item.iapId) {
    const product = rcProducts.find((p) => p.identifier === item.iapId);
    return product ? product.product.priceString : "Echtgeld";
  }
  return "";
};

const getButtonLabel = (item, rcProducts) => {
  if (item.currency.includes("iap") && item.iapId) {
    const product = rcProducts.find((p) => p.identifier === item.iapId);
    return (
      "Für " + (product ? product.product.priceString : "Echtgeld") + " kaufen"
    );
  }
  return "Kaufen";
};

const getImageSource = (item, imageMap) =>
  item.skinImage ||
  item.charImage ||
  imageMap?.[`class_${item.characterId}`] ||
  require("../assets/logo.png");

const ShopItemCard = ({ item, onBuy, styles, rcProducts, imageMap }) => (
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
      <Text style={styles.price}>{getPriceLabel(item, rcProducts)}</Text>
      <TouchableOpacity style={styles.button} onPress={() => onBuy(item)}>
        <Text style={styles.buttonText}>
          {getButtonLabel(item, rcProducts)}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function ShopScreen() {
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [index, setIndex] = useState(0);
  const [rcProducts, setRcProducts] = useState([]);

  // Nur abrufen, wenn mind. 1 IAP-Produkt vorhanden ist
  const hasIAPItems = useMemo(
    () => SHOP_ITEMS.some((item) => item.currency.includes("iap")),
    []
  );

  useEffect(() => {
    if (!hasIAPItems) return;

    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey;
    if (!apiKey) {
      console.warn(
        "RevenueCat API Key nicht gefunden! Bitte .env und app.config.js prüfen."
      );
      return;
    }

    Purchases.configure({ apiKey });

    const fetchProducts = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current &&
          offerings.current.availablePackages.length > 0
        ) {
          setRcProducts(offerings.current.availablePackages);
        }
      } catch (error) {
        console.log("Fehler beim Abrufen der Produkte:", error);
      }
    };

    fetchProducts();
  }, [hasIAPItems]);

  const categories = useMemo(
    () => Array.from(new Set(SHOP_ITEMS.map((item) => item.category))),
    []
  );

  const routes = useMemo(
    () =>
      categories.map((key) => ({
        key,
        title: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      })),
    [categories]
  );

  const getVisibleShopItems = useCallback(
    (category) => SHOP_ITEMS.filter((item) => item.category === category),
    []
  );

  const executePurchase = useCallback(async (item, payWith, deductFunc) => {
    deductFunc(item.price);
    await AsyncStorage.setItem(
      item.category === "skin"
        ? `unlock_skin_${item.id}`
        : `unlock_character_${item.characterId}`,
      "true"
    );
    DeviceEventEmitter.emit("skin:updated");
    alert(`Du hast ${item.name} für ${item.price} ${payWith} gekauft.`);
  }, []);

  const handleBuy = useCallback(
    async (item) => {
      const { price, currency, iapId } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");
      const canBuyIAP = currency.includes("iap") && iapId;

      if (canPayCoins && coins >= price) {
        return executePurchase(item, "Coins", spendCoins);
      }
      if (canPayCrystals && crystals >= price) {
        return executePurchase(item, "Kristalle", spendCrystals);
      }
      if (canBuyIAP) {
        try {
          const pkg = rcProducts.find((p) => p.identifier === iapId);
          if (!pkg) throw new Error("Produkt nicht gefunden");
          await Purchases.purchasePackage(pkg);
          await executePurchase(item, "IAP", () => {});
        } catch (err) {
          if (!err.userCancelled) {
            alert("Kauf fehlgeschlagen: " + err.message);
          }
        }
        return;
      }

      // Nur eigenen Alert, keine Meldung über "kein Echtgeldkauf möglich"
      if (canPayCoins && coins < price) {
        return alert("Nicht genug Coins .");
      }
      if (canPayCrystals && crystals < price) {
        return alert("Nicht genug Kristalle.");
      }

      return alert("Nicht genug Währung vorhanden.");
    },
    [coins, crystals, executePurchase, spendCoins, spendCrystals, rcProducts]
  );

  const renderScene = useMemo(
    () =>
      SceneMap(
        routes.reduce((scenes, route) => {
          scenes[route.key] = () => (
            <FlatList
              data={getVisibleShopItems(route.key)}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <ShopItemCard
                  item={item}
                  onBuy={handleBuy}
                  styles={styles}
                  rcProducts={rcProducts}
                  imageMap={imageMap}
                />
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  Noch keine Angebote in dieser Kategorie.
                </Text>
              }
            />
          );
          return scenes;
        }, {})
      ),
    [routes, getVisibleShopItems, handleBuy, styles, rcProducts, imageMap]
  );

  return (
    <ScreenLayout style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
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

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    list: {
      padding: 20,
      paddingBottom: 40,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 18,
      backgroundColor: theme.accentColor,
      paddingVertical: 16,
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    iconImage: {
      width: 100,
      height: 100,
      borderRadius: 22,
      marginRight: 18,
    },
    cardContent: {
      flex: 1,
      justifyContent: "center",
    },
    name: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.textColor,
      textAlign: "center",
      marginBottom: 4,
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
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
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
    skinFor: {
      fontSize: 13,
      color: theme.borderGlowColor,
      marginBottom: 2,
      textAlign: "center",
    },
  });
}
