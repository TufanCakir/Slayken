import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  DeviceEventEmitter,
  ActivityIndicator, // Für Lade-Indikator
  Alert, // Für verbesserte Alerts
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

// Hilfsfunktionen bleiben gleich, da sie bereits gut sind
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

const getButtonLabel = (item, rcProducts, isBuying) => {
  if (isBuying) {
    return "Wird gekauft...";
  }
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

// ShopItemCard erhält jetzt einen isBuying-Prop
const ShopItemCard = ({
  item,
  onBuy,
  styles,
  rcProducts,
  imageMap,
  isBuying,
}) => (
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => onBuy(item)}
        disabled={isBuying} // Button während des Kaufs deaktivieren
      >
        {isBuying ? (
          <ActivityIndicator color={styles.buttonText.color} /> // Lade-Indikator im Button
        ) : (
          <Text style={styles.buttonText}>
            {getButtonLabel(item, rcProducts, isBuying)}
          </Text>
        )}
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
  const [isBuying, setIsBuying] = useState(false); // Neuer State für Ladezustand
  const [buyingItemId, setBuyingItemId] = useState(null); // Speichert die ID des aktuell gekauften Items

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
      // Optional: Ein Benutzer-Alert, wenn der API-Schlüssel fehlt und IAPs erwartet werden
      // Alert.alert("Fehler", "In-App-Käufe sind derzeit nicht verfügbar.");
      return;
    }

    Purchases.configure({ apiKey });

    const fetchProducts = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        console.log("Alle RevenueCat Offerings:", offerings.all); // Hilfreich zum Debuggen!

        // Zugriff auf dein spezifisches Offering über seinen Identifier
        const myExclusiveSkinsOffering = offerings.all["exclusive_skins"];

        if (
          myExclusiveSkinsOffering &&
          myExclusiveSkinsOffering.availablePackages.length > 0
        ) {
          setRcProducts(myExclusiveSkinsOffering.availablePackages);
          console.log(
            "Verfügbare RC-Produkte aus 'exclusive_skins' Offering:",
            myExclusiveSkinsOffering.availablePackages
          );
        } else {
          console.log(
            "Das 'exclusive_skins' Offering oder seine Packages wurden nicht gefunden."
          );
          // Optional: Eine Fehlermeldung für den Nutzer, wenn dieses spezifische Offering nicht geladen werden kann
          Alert.alert(
            "Fehler",
            "Exklusive Skins konnten nicht geladen werden. Bitte versuchen Sie es später erneut."
          );
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Produkte:", error); // console.error ist besser für Fehler
        Alert.alert(
          "Verbindungsfehler",
          "Konnte In-App-Produkte nicht laden. Bitte überprüfe deine Internetverbindung."
        );
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

  const executePurchase = useCallback(
    async (item, payWith) => {
      // Hier wird keine Währung abgezogen, wenn es ein IAP-Kauf ist.
      if (payWith === "Coins") {
        spendCoins(item.price);
      } else if (payWith === "Kristalle") {
        spendCrystals(item.price);
      }

      await AsyncStorage.setItem(
        item.category === "skin"
          ? `unlock_skin_${item.id}`
          : `unlock_character_${item.characterId}`,
        "true"
      );
      DeviceEventEmitter.emit("skin:updated");

      Alert.alert(
        "Kauf erfolgreich!",
        `Du hast ${item.name} für ${item.price} ${payWith} gekauft. Viel Spaß damit!`
      );
    },
    [spendCoins, spendCrystals]
  ); // Abhängigkeiten hinzugefügt

  const handleBuy = useCallback(
    async (item) => {
      // Wenn bereits ein Kauf läuft, ignorieren
      if (isBuying) return;

      setIsBuying(true); // Ladezustand aktivieren
      setBuyingItemId(item.id); // Aktuelles Kauf-Item speichern

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
          if (!pkg) {
            throw new Error(
              "Produkt konnte im Shop nicht gefunden werden. Bitte versuchen Sie es später erneut."
            );
          }
          await Purchases.purchasePackage(pkg);
          await executePurchase(item, "Echtgeld"); // Für IAP-Käufe verwenden wir "Echtgeld" als Währung
        } else {
          // Fallback für nicht genug Währung
          if (canPayCoins && coins < price) {
            Alert.alert(
              "Nicht genug Coins",
              `Du benötigst ${price - coins} weitere Coins, um ${
                item.name
              } zu kaufen.`
            );
          } else if (canPayCrystals && crystals < price) {
            Alert.alert(
              "Nicht genug Kristalle",
              `Du benötigst ${price - crystals} weitere Kristalle, um ${
                item.name
              } zu kaufen.`
            );
          } else {
            Alert.alert(
              "Kauf nicht möglich",
              "Es ist nicht genügend Währung vorhanden oder der Kaufweg ist nicht gültig."
            );
          }
        }
      } catch (err) {
        if (err.userCancelled) {
          Alert.alert(
            "Kauf abgebrochen",
            "Du hast den Kaufvorgang abgebrochen."
          );
        } else {
          console.error("Fehler beim Kauf:", err); // Detailliertes Logging
          Alert.alert(
            "Kauf fehlgeschlagen",
            `Beim Kauf von ${item.name} ist ein Fehler aufgetreten: ${
              err.message || "Unbekannter Fehler"
            }. Bitte versuche es erneut.`
          );
        }
      } finally {
        setIsBuying(false); // Ladezustand deaktivieren
        setBuyingItemId(null); // Kauf-Item-ID zurücksetzen
      }
    },
    [coins, crystals, executePurchase, rcProducts, isBuying] // isBuying zu Abhängigkeiten hinzugefügt
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
                  isBuying={isBuying && buyingItemId === item.id} // isBuying für diese spezifische Karte
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
    ] // isBuying und buyingItemId zu Abhängigkeiten hinzugefügt
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
