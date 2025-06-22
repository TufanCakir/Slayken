import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import Icon from "../components/Icon";
import SHOP_ITEMS from "../data/shopData.json";
import ScreenLayout from "../components/ScreenLayout";

const BLUE_BG = "#0f172a";
const BLUE_CARD = "#1e293b";
const BLUE_BORDER = "#2563eb";
const BLUE_SHADOW = "#60a5fa";
const BLUE_ACCENT = "#38bdf8";
const BLUE_TEXT = "#f0f9ff";
const BLUE_MUTED = "#a7c7e7";

const ShopItemCard = React.memo(({ item, onBuy }) => {
  const { price, currency } = item;
  let priceLabel = "";
  if (currency.length === 2) {
    priceLabel = `${price} Coins oder ${price} Kristalle`;
  } else if (currency[0] === "coin") {
    priceLabel = `${price} Coins`;
  } else {
    priceLabel = `${price} Kristalle`;
  }

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Icon name={item.iconName} size={40} color={BLUE_ACCENT} />
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{priceLabel}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => onBuy(item)}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Kaufen</Text>
      </TouchableOpacity>
    </View>
  );
});

export default function ShopScreen() {
  const layout = Dimensions.get("window");
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();

  const categories = useMemo(
    () => Array.from(new Set(SHOP_ITEMS.map((i) => i.category))),
    []
  );
  const routes = useMemo(
    () =>
      categories.map((key) => ({
        key,
        title: key
          .replace(/_/g, " ") // underscores → Leerzeichen
          .replace(/\b\w/g, (c) => c.toUpperCase()), // erste Buchstaben groß
      })),
    [categories]
  );

  const [index, setIndex] = useState(0);

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

  const renderScene = SceneMap(
    routes.reduce((scenes, route) => {
      scenes[route.key] = () => {
        const data = SHOP_ITEMS.filter((i) => i.category === route.key);
        return (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ShopItemCard item={item} onBuy={handleBuy} />
            )}
          />
        );
      };
      return scenes;
    }, {})
  );

  return (
    <ScreenLayout style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            scrollEnabled
            style={{ backgroundColor: BLUE_BG }}
            indicatorStyle={{ backgroundColor: BLUE_ACCENT }}
            labelStyle={{ color: BLUE_TEXT, fontWeight: "bold" }}
          />
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BLUE_BG },
  list: { padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 22,
    marginBottom: 18,
    alignItems: "center",
    backgroundColor: BLUE_CARD,
    borderColor: `${BLUE_ACCENT}88`,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: Platform.OS === "android" ? 6 : 0,
    zIndex: 2,
  },
  icon: { marginBottom: 10 },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: BLUE_ACCENT,
    marginBottom: 4,
    letterSpacing: 0.05,
  },
  price: {
    fontSize: 14,
    color: BLUE_TEXT,
    marginBottom: 12,
    letterSpacing: 0.03,
  },
  button: {
    backgroundColor: BLUE_ACCENT,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    marginTop: 8,
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
  },
  buttonText: {
    color: BLUE_BG,
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.12,
    textShadowColor: "#60a5fa44",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
