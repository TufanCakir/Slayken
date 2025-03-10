import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// Shop-Angebote
export const shopItems = [
  { id: "item-1", title: "10 Crystals", crystals: 10, price: 100 },
  { id: "item-2", title: "50 Crystals", crystals: 50, price: 400 },
  { id: "item-3", title: "100 Crystals", crystals: 100, price: 700 },
];

const COIN_STORAGE_KEY = "coins";
const CRYSTAL_STORAGE_KEY = "crystals";

export const useShopLogic = () => {
  const [coins, setCoins] = useState(0);
  const [crystals, setCrystals] = useState(0);
  const [loading, setLoading] = useState(true);

  // Lade Coins und Crystals aus AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCoins = await AsyncStorage.getItem(COIN_STORAGE_KEY);
        const storedCrystals = await AsyncStorage.getItem(CRYSTAL_STORAGE_KEY);
        setCoins(storedCoins ? parseInt(storedCoins) : 0);
        setCrystals(storedCrystals ? parseInt(storedCrystals) : 0);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Speichert den aktuellen Coin- und Crystal-Wert in AsyncStorage
  const saveData = async (newCoins, newCrystals) => {
    try {
      await AsyncStorage.setItem(COIN_STORAGE_KEY, newCoins.toString());
      await AsyncStorage.setItem(CRYSTAL_STORAGE_KEY, newCrystals.toString());
      setCoins(newCoins);
      setCrystals(newCrystals);
    } catch (error) {
      console.error("Fehler beim Speichern der Daten:", error);
    }
  };

  // Behandlung eines Kaufs
  const handlePurchase = (item) => {
    if (coins < item.price) {
      Alert.alert(
        "Nicht genügend Coins",
        "Du hast nicht genügend Coins, um dieses Angebot zu kaufen."
      );
      return;
    }
    const newCoins = coins - item.price;
    const newCrystals = crystals + item.crystals;
    saveData(newCoins, newCrystals);
    Alert.alert("Kauf erfolgreich", `Du hast ${item.title} erworben!`);
  };

  return { coins, crystals, loading, handlePurchase };
};
