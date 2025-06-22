import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import Icon from "../components/Icon";
import SHOP_ITEMS from "../data/shopData.json";
import { CATEGORY_TITLES } from "../constants/ShopList";
import ScreenLayout from "../components/ScreenLayout";

// BLUE-THEME COLORS
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
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();

  const categories = useMemo(
    () => Array.from(new Set(SHOP_ITEMS.map((i) => i.category))),
    []
  );
  const routes = useMemo(
    () => categories.map((key) => ({ key, title: CATEGORY_TITLES[key] })),
    [categories]
  );
  const [index, setIndex] = useState(0);

  const balanceText = useMemo(() => {
    return routes[index].key === "crystal"
      ? `Kristalle: ${crystals}`
      : `Coins: ${coins}`;
  }, [index, coins, crystals, routes]);

  const executePurchase = useCallback(
    async ({ id, name, price }, payWith, deductFunc) => {
      deductFunc(price);
      await AsyncStorage.setItem(`unlocked_item_${id}`, "true");
      Alert.alert("Erfolg", `Du hast ${name} für ${price} ${payWith} gekauft.`);
    },
    []
  );

  const handleBuy = useCallback(
    (item) => {
      const { price, currency } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");

      if (canPayCrystals && !canPayCoins) {
        if (crystals < price) {
          return Alert.alert("Fehler", "Unzureichende Kristalle.");
        }
        return executePurchase(item, "Kristalle", spendCrystals);
      }

      if (canPayCoins && !canPayCrystals) {
        if (coins < price) {
          return Alert.alert("Fehler", "Unzureichende Coins.");
        }
        return executePurchase(item, "Coins", spendCoins);
      }

      if (canPayCoins && canPayCrystals) {
        if (coins >= price) {
          return executePurchase(item, "Coins", spendCoins);
        }
        if (crystals >= price) {
          return Alert.alert(
            "Nicht genügend Coins",
            "Du hast nicht genug Coins. Möchtest du stattdessen mit Kristallen bezahlen?",
            [
              { text: "Abbrechen", style: "cancel" },
              {
                text: "Mit Kristallen bezahlen",
                onPress: () =>
                  executePurchase(item, "Kristalle", spendCrystals),
              },
            ],
            { cancelable: true }
          );
        }
        return Alert.alert(
          "Fehler",
          "Weder genügend Coins noch Kristalle vorhanden."
        );
      }
      return Alert.alert("Fehler", "Ungültige Zahlungsoption.");
    },
    [coins, crystals, executePurchase, spendCoins, spendCrystals]
  );

  const renderList = useCallback(
    (category) => {
      const data = SHOP_ITEMS.filter((i) => i.category === category);
      if (data.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Keine Artikel verfügbar.</Text>
          </View>
        );
      }
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
    },
    [handleBuy]
  );

  return (
    <ScreenLayout style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Text style={styles.balance}>{balanceText}</Text>

      <View style={styles.pickerContainer}>
        <RNPickerSelect
          value={routes[index].key}
          onValueChange={(value) => {
            const selectedIndex = routes.findIndex((r) => r.key === value);
            if (selectedIndex !== -1) setIndex(selectedIndex);
          }}
          items={routes.map((r) => ({
            label: r.title,
            value: r.key,
          }))}
          placeholder={{ label: "Kategorie wählen...", value: null }}
          useNativeAndroidPickerStyle={false}
          Icon={() => (
            <MaterialIcons
              name="keyboard-arrow-down"
              size={28}
              color={BLUE_ACCENT}
            />
          )}
          style={{
            inputIOS: styles.pickerInputIOS,
            inputAndroid: styles.pickerInputAndroid,
            viewContainer: {
              zIndex: 10,
              position: Platform.OS === "ios" ? "relative" : undefined,
              elevation: 10,
            },
          }}
        />
      </View>

      {renderList(routes[index].key)}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BLUE_BG,
  },
  balance: {
    fontSize: 19,
    fontWeight: "bold",
    color: BLUE_ACCENT,
    marginTop: 22,
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: 0.2,
    zIndex: 2,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  pickerContainer: {
    paddingHorizontal: 20,
    marginBottom: 18,
    zIndex: 10,
    position: Platform.OS === "ios" ? "relative" : undefined,
  },
  pickerInputIOS: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
    backgroundColor: BLUE_CARD,
    color: BLUE_TEXT,
    fontSize: 16,
    fontWeight: "bold",
    shadowColor: BLUE_SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  pickerInputAndroid: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BLUE_ACCENT,
    backgroundColor: BLUE_CARD,
    color: BLUE_TEXT,
    fontSize: 16,
    fontWeight: "bold",
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  emptyText: {
    fontStyle: "italic",
    color: BLUE_MUTED,
    fontSize: 16,
    textAlign: "center",
    marginTop: 28,
  },
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
