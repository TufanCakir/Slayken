import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
  ActivityIndicator,
  Alert,
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

const getPriceAndButtonLabel = (item, rcProducts, isBuying) => {
  if (item.currency.includes("iap") && item.iapId) {
    const product = rcProducts.find((p) => p.identifier === item.iapId);
    const priceString = product ? product.product.priceString : "Echtgeld";
    return {
      priceLabel: priceString,
      buttonLabel: isBuying ? "Wird gekauft..." : `Für ${priceString} kaufen`,
    };
  }
  if (item.currency.includes("coin") && item.currency.includes("crystal")) {
    return {
      priceLabel: `${item.price} Coins/Kristalle`,
      buttonLabel: isBuying ? "Wird gekauft..." : "Kaufen",
    };
  }
  if (item.currency.includes("coin")) {
    return {
      priceLabel: `${item.price} Coins`,
      buttonLabel: isBuying ? "Wird gekauft..." : "Kaufen",
    };
  }
  if (item.currency.includes("crystal")) {
    return {
      priceLabel: `${item.price} Kristalle`,
      buttonLabel: isBuying ? "Wird gekauft..." : "Kaufen",
    };
  }
  return {
    priceLabel: "",
    buttonLabel: isBuying ? "Wird gekauft..." : "Kaufen",
  };
};

const getImageSource = (item, imageMap) =>
  item.skinImage ||
  item.charImage ||
  imageMap?.[`class_${item.characterId}`] ||
  require("../assets/logo.png");

const ShopItemCard = ({
  item,
  onBuy,
  styles,
  rcProducts,
  imageMap,
  isBuying,
}) => {
  const { priceLabel, buttonLabel } = getPriceAndButtonLabel(
    item,
    rcProducts,
    isBuying
  );

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
        <TouchableOpacity
          style={styles.button}
          onPress={() => onBuy(item)}
          disabled={isBuying}
        >
          {isBuying ? (
            <ActivityIndicator color={styles.buttonText.color} />
          ) : (
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function ShopScreen() {
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [index, setIndex] = useState(0);
  const [rcProducts, setRcProducts] = useState([]);
  const [isBuying, setIsBuying] = useState(false);
  const [buyingItemId, setBuyingItemId] = useState(null);

  const hasIAPItems = useMemo(
    () => SHOP_ITEMS.some((item) => item.currency.includes("iap")),
    []
  );

  useEffect(() => {
    if (!hasIAPItems) return;

    const apiKey = Constants.expoConfig?.extra?.revenueCatApiKey;
    if (!apiKey) {
      console.warn("RevenueCat API Key fehlt");
      return;
    }

    Purchases.configure({ apiKey });

    const fetchProducts = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        const exclusiveOffering = offerings.all["exclusive_skins"];
        if (
          exclusiveOffering &&
          exclusiveOffering.availablePackages.length > 0
        ) {
          setRcProducts(exclusiveOffering.availablePackages);
        } else {
          Alert.alert(
            "Shop nicht verfügbar",
            "Exklusive Skins konnten nicht geladen werden. Bitte später erneut versuchen."
          );
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Offerings:", error);
        Alert.alert(
          "Fehler",
          "Konnte In-App-Produkte nicht laden. Bitte überprüfe deine Verbindung."
        );
      }
    };
    fetchProducts();
  }, [hasIAPItems]);

  const categories = useMemo(
    () => [...new Set(SHOP_ITEMS.map((item) => item.category))],
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

  const executePurchase = useCallback(
    async (item, payWith) => {
      if (payWith === "Coins") spendCoins(item.price);
      else if (payWith === "Kristalle") spendCrystals(item.price);

      await AsyncStorage.setItem(
        item.category === "skin"
          ? `unlock_skin_${item.id}`
          : `unlock_character_${item.characterId}`,
        "true"
      );
      DeviceEventEmitter.emit("skin:updated");

      Alert.alert(
        "Kauf erfolgreich!",
        `Du hast ${item.name} für ${item.price} ${payWith} gekauft.`
      );
    },
    [spendCoins, spendCrystals]
  );

  const handleBuy = useCallback(
    async (item) => {
      if (isBuying) return;

      setIsBuying(true);
      setBuyingItemId(item.id);

      const { price, currency, iapId } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");
      const canBuyIAP = currency.includes("iap") && iapId;

      try {
        if (canPayCoins && coins >= price) {
          await executePurchase(item, "Coins");
        } else if (canPayCrystals && crystals >= price) {
          await executePurchase(item, "Kristalle");
        } else if (canBuyIAP) {
          const pkg = rcProducts.find((p) => p.identifier === iapId);
          if (!pkg) throw new Error("Produkt konnte nicht gefunden werden.");
          await Purchases.purchasePackage(pkg);
          await executePurchase(item, "Echtgeld");
        } else {
          if (canPayCoins && coins < price) {
            Alert.alert(
              "Nicht genug Coins",
              `Du benötigst ${price - coins} weitere Coins.`
            );
          } else if (canPayCrystals && crystals < price) {
            Alert.alert(
              "Nicht genug Kristalle",
              `Du benötigst ${price - crystals} weitere Kristalle.`
            );
          } else {
            Alert.alert(
              "Kauf nicht möglich",
              "Nicht genügend Währung oder falscher Kaufweg."
            );
          }
        }
      } catch (err) {
        if (err.userCancelled) {
          Alert.alert("Abgebrochen", "Du hast den Kauf abgebrochen.");
        } else {
          console.error("Fehler beim Kauf:", err);
          Alert.alert(
            "Fehler",
            `Beim Kauf ist ein Fehler aufgetreten: ${
              err.message || "Unbekannt"
            }`
          );
        }
      } finally {
        setIsBuying(false);
        setBuyingItemId(null);
      }
    },
    [coins, crystals, executePurchase, rcProducts, isBuying]
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
                  isBuying={isBuying && buyingItemId === item.id}
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
    [
      routes,
      getVisibleShopItems,
      handleBuy,
      styles,
      rcProducts,
      imageMap,
      isBuying,
      buyingItemId,
    ]
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
