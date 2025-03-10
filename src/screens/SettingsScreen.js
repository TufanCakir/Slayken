// src/screens/SettingsScreen.js
import React, { useState } from "react";
import { View, Modal, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates"; // 🔹 Expo für App-Neustart importieren
import GradientButton from "../components/GradientButton";
import Footer from "../components/Footer";
import SettingsModal from "../components/SettingsModal";
import styles from "../styles/SettingsStyles";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  // 🔹 Funktion, um den Account zurückzusetzen
  const resetAccount = async () => {
    try {
      await AsyncStorage.clear(); // 🔹 Löscht alle gespeicherten Daten
      await AsyncStorage.setItem("testModeUses", "5"); // 🔹 Setzt den Bonus auf 5 zurück
      await AsyncStorage.setItem("coins", "0"); // 🔹 Setzt Coins auf 0
      await AsyncStorage.setItem(
        "backgroundColors",
        JSON.stringify(["black", "blue", "black"])
      ); // 🔹 Setzt Standard-Hintergrund

      Alert.alert("Erfolg", "Alle Account-Daten wurden zurückgesetzt.", [
        { text: "OK", onPress: async () => await Updates.reloadAsync() }, // 🔹 App sofort neuladen
      ]);

      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Fehler",
        "Beim Zurücksetzen der Daten ist ein Fehler aufgetreten."
      );
      console.error("Fehler beim Zurücksetzen von AsyncStorage:", error);
    }
  };

  // 🔹 Bestätigungsdialog vor dem Löschen
  const confirmReset = () => {
    Alert.alert(
      "Account zurücksetzen",
      "Bist du sicher? Dies wird alle Daten löschen und kann nicht rückgängig gemacht werden!",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Ja, zurücksetzen",
          onPress: resetAccount,
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GradientButton
        title="Open"
        onPress={() => setModalVisible(true)}
        style={styles.menuButton}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <SettingsModal
            navigation={navigation}
            onClose={() => setModalVisible(false)}
            onResetAccount={confirmReset} // 🔹 Bestätigung vor dem Reset
          />
        </View>
      </Modal>

      <Footer />
    </View>
  );
}
