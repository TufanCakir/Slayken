// src/components/SettingsModal.js
import React from "react";
import { View, FlatList, Linking, Alert } from "react-native";
import GradientButton from "./GradientButton";
import styles from "../styles/SettingsStyles";

const buttons = [
  { title: "Terms of Service", screen: "TermsOfServiceScreen" },
  { title: "News", screen: "NewsScreen" },
  { title: "Set Background", screen: "BackgroundSelectionScreen" },
  {
    title: "YouTube",
    url: "https://youtube.com/@tufan-cakir?si=IKC-bE5BbBkdIsck",
  },
  {
    title: "TikTok",
    url: "https://www.tiktok.com/@tufan_cakir_?is_from_webapp=1&sender_device=pc",
  },
  { title: "Instagram", url: "https://www.instagram.com/tufan_cakir_/" },
  { title: "GitHub", url: "https://github.com/TufanCakir" },
  { title: "itch.io", url: "https://tufan-cakir.itch.io/" },
  { title: "Website", url: "https://www.slayken.com/" },
];

export default function SettingsModal({ navigation, onClose, onResetAccount }) {
  const handlePress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.url) {
      Linking.canOpenURL(item.url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(item.url);
          } else {
            Alert.alert("Error", "Cannot open URL: " + item.url);
          }
        })
        .catch((err) => Alert.alert("Error", err.message));
    }
    onClose();
  };

  return (
    <View style={styles.modalContent}>
      <FlatList
        data={buttons}
        keyExtractor={(item, index) =>
          item.screen || item.url || index.toString()
        }
        numColumns={3}
        renderItem={({ item }) => (
          <GradientButton
            title={item.title}
            onPress={() => handlePress(item)}
            style={styles.button}
          />
        )}
      />
      <GradientButton
        title="Account Reset"
        onPress={onResetAccount}
        style={styles.resetButton}
      />
      <GradientButton
        title="Close"
        onPress={onClose}
        style={styles.closeButton}
        textStyle={{ fontSize: 30 }}
      />
    </View>
  );
}
