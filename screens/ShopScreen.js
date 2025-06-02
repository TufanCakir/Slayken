// Datei: screens/ShopScreen.js
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
import { useThemeContext } from "../context/ThemeContext";
import { useCoins } from "../context/CoinContext";
import { useCrystals } from "../context/CrystalContext";
import Icon from "../components/Icon";
import SHOP_ITEMS from "../data/shopData.json";
import { CATEGORY_TITLES } from "../constants/ShopList";
import ScreenLayout from "../components/ScreenLayout";

const ShopItemCard = React.memo(({ item, onBuy, theme }) => {
  const { price, currency } = item;

  // Preis-Label erstellen
  let priceLabel = "";
  if (currency.length === 2) {
    priceLabel = `${price} Coins oder ${price} Kristalle`;
  } else if (currency[0] === "coin") {
    priceLabel = `${price} Coins`;
  } else {
    priceLabel = `${price} Kristalle`;
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.accentColor,
          borderColor: theme.shadowColor,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      <View style={styles.icon}>
        <Icon name={item.iconName} size={40} color={theme.textColor} />
      </View>
      <Text style={[styles.name, { color: theme.textColor }]}>{item.name}</Text>
      <Text style={[styles.price, { color: theme.textColor }]}>
        {priceLabel}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.accentColor }]}
        onPress={() => onBuy(item)}
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: theme.textColor }]}>
          Kaufen
        </Text>
      </TouchableOpacity>
    </View>
  );
});

export default function ShopScreen() {
  const { theme, uiThemeType } = useThemeContext();
  const { coins, spendCoins } = useCoins();
  const { crystals, spendCrystals } = useCrystals();

  const layoutWidth = Dimensions.get("window").width;
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

  // Helfer: Kauf-Transaktion ausführen
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
      const { price, currency, id, name } = item;
      const canPayCoins = currency.includes("coin");
      const canPayCrystals = currency.includes("crystal");

      // Nur Kristalle
      if (canPayCrystals && !canPayCoins) {
        if (crystals < price) {
          return Alert.alert("Fehler", "Unzureichende Kristalle.");
        }
        return executePurchase(item, "Kristalle", spendCrystals);
      }

      // Nur Coins
      if (canPayCoins && !canPayCrystals) {
        if (coins < price) {
          return Alert.alert("Fehler", "Unzureichende Coins.");
        }
        return executePurchase(item, "Coins", spendCoins);
      }

      // Beides möglich
      if (canPayCoins && canPayCrystals) {
        // a) Genug Coins?
        if (coins >= price) {
          return executePurchase(item, "Coins", spendCoins);
        }
        // b) Nicht genug Coins, aber ausreichend Kristalle?
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
        // c) Weder Coins noch Kristalle
        return Alert.alert(
          "Fehler",
          "Weder genügend Coins noch Kristalle vorhanden."
        );
      }

      // Fallback (sollte nicht eintreten)
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
            <Text style={[styles.emptyText, { color: theme.textColor }]}>
              Keine Artikel verfügbar.
            </Text>
          </View>
        );
      }
      return (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ShopItemCard item={item} onBuy={handleBuy} theme={theme} />
          )}
        />
      );
    },
    [handleBuy, theme]
  );

  return (
    <ScreenLayout style={styles.container}>
      <View style={[StyleSheet.absoluteFill]} pointerEvents="box-none" />

      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={uiThemeType === "dark" ? "light-content" : "dark-content"}
      />

      <Text style={[styles.balance, { color: theme.textColor }]}>
        {balanceText}
      </Text>

      {/* Picker-Container mit hohem zIndex und position für iOS */}
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
              name="keyboard-arrow-down" // oder z. B. "expand-more", "arrow-drop-down" etc.
              size={50}
              color={theme.textColor}
            />
          )}
          style={{
            inputIOS: styles.pickerInputIOS(theme),
            inputAndroid: styles.pickerInputAndroid(theme),
            // Wichtig: viewContainer, damit das Dropdown/Modal im Vordergrund liegt
            viewContainer: {
              zIndex: 10,
              position: Platform.OS === "ios" ? "relative" : undefined,
              elevation: 10, // Android: sorgt dafür, dass das native Modal/Dropdown oben liegt
            },
          }}
        />
      </View>

      {renderList(routes[index].key)}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  balance: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 16,
    textAlign: "center",
    zIndex: 2, // reicht hier, da nur der Text gerendert wird
  },
  pickerContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    zIndex: 10, // deutlich höher als die Cards (dort zIndex: 2)
    position: Platform.OS === "ios" ? "relative" : undefined,
  },
  pickerInputIOS: (theme) => ({
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    backgroundColor: theme.accentColor,
    color: theme.textColor,
    fontSize: 16,
  }),
  pickerInputAndroid: (theme) => ({
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.shadowColor,
    backgroundColor: theme.accentColor,
    color: theme.textColor,
    fontSize: 16,
  }),

  list: { padding: 20, paddingBottom: 40 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 2,
  },
  emptyText: { fontStyle: "italic" },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: Platform.select({ ios: "#1a1a1a", android: "#1a1a1a" }),
    borderColor: Platform.select({ ios: "#1a1a1a", android: "#1a1a1a" }),
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: { elevation: 6 },
    }),
    zIndex: 2, // damit die Cards standardmäßig hinter dem Picker liegen
  },
  icon: { marginBottom: 8 },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  price: { fontSize: 14, marginBottom: 12 },
  button: { paddingVertical: 8, paddingHorizontal: 24, borderRadius: 8 },
  buttonText: { fontSize: 14, fontWeight: "bold" },
});
