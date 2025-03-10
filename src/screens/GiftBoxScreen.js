import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGift } from "../hooks/useGift";
import styles from "../styles/GiftBoxStyles";
import Footer from "../components/Footer";
import { LinearGradient } from "expo-linear-gradient";

// STORAGE_KEY für den AsyncStorage
const STORAGE_KEY = "gift_box_state";

const GiftBox = () => {
  // useGift verwaltet den globalen Zustand (Coins und Crystals)
  const { addCoins, addCrystals } = useGift();

  // Lokaler State für die aktuell verfügbaren Geschenke, initial alle unbeansprucht
  const [availableGifts, setAvailableGifts] = useState([
    { type: "coins", amount: 100, claimed: false },
    { type: "crystals", amount: 50, claimed: false },
    { type: "energy", amount: 20, claimed: false },
  ]);

  // Zum Anzeigen eines Ladeindikators (z. B. falls etwas asynchron geladen wird)
  const [loading, setLoading] = useState(false);

  // Lade den gespeicherten Zustand beim Mounten
  useEffect(() => {
    const loadGiftState = async () => {
      try {
        const storedGifts = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedGifts) {
          setAvailableGifts(JSON.parse(storedGifts));
        }
      } catch (error) {
        console.error("Fehler beim Laden des Geschenk-Status:", error);
      }
    };
    loadGiftState();
  }, []);

  // Speichere den Zustand, wenn availableGifts sich ändert
  useEffect(() => {
    const saveGiftState = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(availableGifts));
      } catch (error) {
        console.error("Fehler beim Speichern des Geschenk-Status:", error);
      }
    };
    saveGiftState();
  }, [availableGifts]);

  // Wird aufgerufen, wenn ein Geschenk beansprucht wird
  const handleClaimGift = (index) => {
    const gift = availableGifts[index];
    if (!gift || gift.claimed) return; // Falls das Geschenk bereits beansprucht wurde, nichts tun

    console.log("Gift claimed:", gift);

    // Coins/Crystals zum globalen Zustand hinzufügen
    if (gift.type === "coins") {
      addCoins(gift.amount);
    } else if (gift.type === "crystals") {
      addCrystals(gift.amount);
    }

    // Markiere das beanspruchte Geschenk als beansprucht
    setAvailableGifts((prevGifts) =>
      prevGifts.map((g, i) => (i === index ? { ...g, claimed: true } : g))
    );
  };

  return (
    <LinearGradient
      colors={["black", "blue", "black"]}
      style={styles.background}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      <View style={styles.container}>
        <Text style={[styles.title, { color: "white" }]}>Geschenk Box</Text>
        {availableGifts.length === 0 ? (
          <Text style={[styles.noGiftsText, { color: "white" }]}>
            Keine Geschenke vorhanden.
          </Text>
        ) : (
          availableGifts.map((gift, index) => (
            <LinearGradient
              key={index}
              colors={["black", "blue", "black"]}
              style={styles.giftItem}
            >
              <Text style={{ color: "white" }}>
                <Text style={[styles.giftType, { color: "white" }]}>
                  {gift.type}:
                </Text>{" "}
                {gift.amount}
              </Text>
              <Pressable
                onPress={() => handleClaimGift(index)}
                disabled={!!gift.claimed}
              >
                <LinearGradient
                  colors={["black", "blue", "black"]}
                  style={[styles.button, gift.claimed && styles.disabledButton]}
                >
                  <Text style={[styles.buttonText, { color: "white" }]}>
                    {gift.claimed
                      ? "Bereits beansprucht"
                      : "Geschenk beanspruchen"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </LinearGradient>
          ))
        )}
      </View>
      <Footer />
    </LinearGradient>
  );
};

export default GiftBox;
