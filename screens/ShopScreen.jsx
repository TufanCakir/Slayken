import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import SHOP_ITEMS from "../data/shopData.json";
import EVENT_DATA from "../data/eventData.json";
import ScreenLayout from "../components/ScreenLayout";
import { isActive, formatCountdown } from "../utils/helper";
import { Image } from "expo-image";

const ShopItemCard = React.memo(function ShopItemCard({
  item,
  onBuy,
  theme,
  eventData,
}) {
  const { price, currency, linkedEventId } = item;
  const priceLabel =
    currency.length === 2
      ? `${price} Coins oder ${price} Kristalle`
      : currency[0] === "coin"
      ? `${price} Coins`
      : `${price} Kristalle`;

  const styles = createStyles(theme);

  // Event-Image, falls vorhanden
  const event = EVENT_DATA.find((e) => e.id === linkedEventId);
  const iconImage = event?.image;

  // Countdown-Logik für Events
  const [countdown, setCountdown] = useState(null);
  useEffect(() => {
    if (!linkedEventId) return;
    const foundEvent = eventData.find(
      (e) => e.id === linkedEventId && e.activeTo
    );
    if (!foundEvent) return;
    function updateCountdown() {
      setCountdown(formatCountdown(new Date(foundEvent.activeTo) - Date.now()));
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [linkedEventId, eventData]);

  return (
    <View style={styles.cardRow}>
      <View style={styles.iconWrapper}>
        {iconImage && (
          <Image
            source={iconImage}
            style={styles.iconImage}
            contentFit="contain"
          />
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.price}>{priceLabel}</Text>
        {!!countdown && countdown !== "Vorbei!" && (
          <Text style={styles.countdownActive}>Noch {countdown}</Text>
        )}
        {countdown === "Vorbei!" && (
          <Text style={styles.countdownEnded}>Angebot beendet</Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => onBuy(item)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Kaufen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default function ShopScreen() {
  const layout = Dimensions.get("window");
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  // Kategorien automatisch generieren
  const categories = useMemo(
    () => Array.from(new Set(SHOP_ITEMS.map((i) => i.category))),
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

  const [index, setIndex] = useState(0);

  const linkedEvents = useMemo(
    () => EVENT_DATA.filter(isActive).map((e) => e.id),
    []
  );

  const getVisibleShopItems = useCallback(
    (category) =>
      SHOP_ITEMS.filter(
        (item) =>
          item.category === category &&
          isActive(item) &&
          (!item.linkedEventId || linkedEvents.includes(item.linkedEventId))
      ),
    [linkedEvents]
  );

  const executePurchase = useCallback(
    async ({ id, name, price }, payWith, deductFunc) => {
      deductFunc(price);
      await AsyncStorage.setItem(`unlocked_item_${id}`, "true");
      alert(`Du hast ${name} für ${price} ${payWith} gekauft.`);
    },
    []
  );

  const handleBuy = useCallback(
    (item) => {
      const { price, currency } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");

      if (canPayCrystals && !canPayCoins) {
        if (crystals < price) return alert("Unzureichende Kristalle.");
        return executePurchase(item, "Kristalle", spendCrystals);
      }

      if (canPayCoins && !canPayCrystals) {
        if (coins < price) return alert("Unzureichende Coins.");
        return executePurchase(item, "Coins", spendCoins);
      }

      if (canPayCoins && canPayCrystals) {
        if (coins >= price) return executePurchase(item, "Coins", spendCoins);
        if (crystals >= price)
          return executePurchase(item, "Kristalle", spendCrystals);
        return alert("Weder genügend Coins noch Kristalle vorhanden.");
      }
      return alert("Ungültige Zahlungsoption.");
    },
    [coins, crystals, executePurchase, spendCoins, spendCrystals]
  );

  // Szenen dynamisch erzeugen
  const renderScene = SceneMap(
    routes.reduce((scenes, route) => {
      scenes[route.key] = () => {
        const data = getVisibleShopItems(route.key);
        return (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ShopItemCard
                item={item}
                onBuy={handleBuy}
                theme={theme}
                eventData={EVENT_DATA}
              />
            )}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 50,
                  color: theme.textColor,
                  opacity: 0.7,
                }}
              >
                Noch keine Angebote in dieser Kategorie.
              </Text>
            }
          />
        );
      };
      return scenes;
    }, {})
  );

  return (
    <ScreenLayout style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
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
    iconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 18,
      overflow: "hidden",
    },
    iconImage: {
      width: 100,
      height: 100,
      borderRadius: 22,
    },
    cardContent: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    name: {
      fontSize: 17,
      fontWeight: "bold",
      color: theme.textColor,
      letterSpacing: 0.05,
      textAlign: "center",
      marginBottom: 4,
    },
    price: {
      fontSize: 14,
      color: theme.textColor,
      letterSpacing: 0.03,
      textAlign: "center",
      marginBottom: 12,
    },
    countdownActive: {
      color: theme.textColor,
      fontWeight: "bold",
      marginBottom: 7,
      textAlign: "center",
    },
    countdownEnded: {
      color: theme.textColor,
      fontWeight: "bold",
      marginBottom: 7,
      opacity: 0.7,
      textAlign: "center",
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
  });
}
