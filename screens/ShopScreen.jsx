import React, { useState, useCallback, useMemo } from "react";
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
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import ScreenLayout from "../components/ScreenLayout";
import SHOP_ITEMS from "../data/shopData.json";

const { width: screenWidth } = Dimensions.get("window");

const ShopItemCard = ({ item, onBuy, theme, imageMap, styles }) => (
  <View style={styles.cardRow}>
    <Image
      source={
        item.skinImage ||
        item.charImage ||
        imageMap?.[`class_${item.characterId}`]
      }
      style={styles.iconImage}
      contentFit="contain"
    />
    <View style={styles.cardContent}>
      <Text style={styles.name}>{item.name}</Text>
      {item.category === "skin" && (
        <Text style={styles.skinFor}>Skin für: {item.characterId}</Text>
      )}
      <Text style={styles.price}>
        {item.price} {item.currency.includes("coin") ? "Coins" : "Kristalle"}
      </Text>
      <TouchableOpacity style={styles.button} onPress={() => onBuy(item)}>
        <Text style={styles.buttonText}>Kaufen</Text>
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

  // Filtere nur die Kategorien die du anzeigen willst
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

  const [index, setIndex] = useState(0);

  // Hier wird nach Kategorie gefiltert
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
    DeviceEventEmitter.emit("skin:updated"); // <<< EVENT TRIGGERN
    alert(`Du hast ${item.name} für ${item.price} ${payWith} gekauft.`);
  }, []);

  const handleBuy = useCallback(
    (item) => {
      const { price, currency } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");

      if (canPayCoins && coins >= price) {
        return executePurchase(item, "Coins", spendCoins);
      }
      if (canPayCrystals && crystals >= price) {
        return executePurchase(item, "Kristalle", spendCrystals);
      }
      if (canPayCoins && canPayCrystals) {
        if (coins >= price) return executePurchase(item, "Coins", spendCoins);
        if (crystals >= price)
          return executePurchase(item, "Kristalle", spendCrystals);
        return alert("Weder genügend Coins noch Kristalle vorhanden.");
      }
      return alert("Ungültige Zahlungsoption oder nicht genug Währung.");
    },
    [coins, crystals, executePurchase, spendCoins, spendCrystals]
  );

  const renderScene = useMemo(
    () =>
      SceneMap(
        routes.reduce((scenes, route) => {
          scenes[route.key] = () => {
            const visibleItems = getVisibleShopItems(route.key);
            return (
              <FlatList
                data={visibleItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                  <ShopItemCard
                    item={item}
                    onBuy={handleBuy}
                    theme={theme}
                    imageMap={imageMap}
                    styles={styles}
                  />
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Noch keine Angebote in dieser Kategorie.
                  </Text>
                }
              />
            );
          };
          return scenes;
        }, {})
      ),
    [
      routes,
      getVisibleShopItems,
      handleBuy,
      theme,
      imageMap,
      styles.list,
      styles.emptyText,
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
