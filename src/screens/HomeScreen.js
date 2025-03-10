// src/screens/HomeScreen.js
import React, { useState, useContext, useEffect } from "react";
import { View, Text, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 🔹 Speicher für die Nutzungslimitierung
import GradientButton from "../components/GradientButton";
import Footer from "../components/Footer";
import MenuModal from "../components/MenuModal";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";
import styles from "../styles/HomeScreenStyles";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const { addCoins } = useContext(CoinsContext);
  const { addCrystals } = useContext(CrystalsContext);
  const [remainingUses, setRemainingUses] = useState(5); // 🔹 Coins-Nutzungen, Standard: 5
  const [remainingCrystalsUses, setRemainingCrystalsUses] = useState(5); // 🔹 Crystals-Nutzungen, Standard: 5

  useEffect(() => {
    // Lade verbleibende Nutzungen für Coins und Crystals aus AsyncStorage
    const loadUses = async () => {
      try {
        const storedUses = await AsyncStorage.getItem("testModeUses");
        if (storedUses !== null) {
          setRemainingUses(parseInt(storedUses, 10));
        }
        const storedCrystalsUses = await AsyncStorage.getItem(
          "testModeCrystalsUses"
        );
        if (storedCrystalsUses !== null) {
          setRemainingCrystalsUses(parseInt(storedCrystalsUses, 10));
        }
      } catch (error) {
        console.error("Fehler beim Laden der Nutzungen:", error);
      }
    };
    loadUses();
  }, []);

  const handleTestModeCoins = async () => {
    if (remainingUses > 0) {
      addCoins(100);
      Alert.alert("Bonus", "100 Coins have been added!");
      const newUses = remainingUses - 1;
      setRemainingUses(newUses);
      try {
        await AsyncStorage.setItem("testModeUses", newUses.toString());
      } catch (error) {
        console.error("Fehler beim Speichern der Coins-Nutzungen:", error);
      }
    }
  };

  const handleTestModeCrystals = async () => {
    if (remainingCrystalsUses > 0) {
      addCrystals(100);
      Alert.alert("Bonus", "100 Crystals have been added!");
      const newUses = remainingCrystalsUses - 1;
      setRemainingCrystalsUses(newUses);
      try {
        await AsyncStorage.setItem("testModeCrystalsUses", newUses.toString());
      } catch (error) {
        console.error("Fehler beim Speichern der Crystals-Nutzungen:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <GradientButton
        title="Menü"
        onPress={() => setModalVisible(true)}
        style={styles.menuButton}
      />

      {remainingUses > 0 && (
        <>
          <GradientButton
            title={`Test Mode: Add 100 Coins (${remainingUses}x)`}
            onPress={handleTestModeCoins}
            style={styles.testModeButton}
          />
          <Text style={styles.thankYouText}>
            Thank you for your support! You can claim this bonus {remainingUses}{" "}
            more times. 🎉
          </Text>
        </>
      )}

      {remainingCrystalsUses > 0 && (
        <>
          <GradientButton
            title={`Test Mode: Add 100 Crystals (${remainingCrystalsUses}x)`}
            onPress={handleTestModeCrystals}
            style={styles.testModeButton}
          />
          <Text style={styles.thankYouText}>
            Thank you for your support! You can claim this bonus{" "}
            {remainingCrystalsUses} more times. 🎉
          </Text>
        </>
      )}

      <MenuModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        navigation={navigation}
      />
      <Footer />
    </View>
  );
}
