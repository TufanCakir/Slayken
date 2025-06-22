import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image as RNImage,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import { BlurView } from "expo-blur";
import { useThemeContext } from "../context/ThemeContext";

export default function ScreenshotModal({ screenshotUri, onClose }) {
  const { theme } = useThemeContext();

  // Teilen-Logik
  const shareScreenshot = async () => {
    if (!screenshotUri) {
      Alert.alert("Kein Screenshot", "Bitte erstelle zuerst einen Screenshot.");
      return;
    }
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(screenshotUri);
      } else {
        Alert.alert(
          "Teilen nicht verfügbar",
          "Auf diesem Gerät kann das Teilen nicht durchgeführt werden."
        );
      }
    } catch (e) {
      console.error("Fehler beim Teilen des Screenshots:", e);
    }
  };

  return (
    <Modal
      visible={!!screenshotUri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: "rgba(30,58,138,0.85)", // blue glass
              shadowColor: "#2563eb", // blue
            },
          ]}
        >
          <Text style={[styles.modalHeader, { color: "#fff" }]}>
            Dein Screenshot
          </Text>

          {screenshotUri && (
            <RNImage
              source={{ uri: screenshotUri }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}

          <TouchableOpacity
            style={[styles.modalCloseButton, { backgroundColor: "#3b82f6" }]}
            onPress={onClose}
          >
            <Ionicons name="trash" size={24} color="#fff" />
            <Text style={[styles.modalCloseText, { color: "#fff" }]}>
              Schließen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.photoButton, { backgroundColor: "#1e40af" }]}
            onPress={shareScreenshot}
          >
            <Ionicons name="share-social" size={24} color="#fff" />
            <Text style={[styles.photoButtonText, { color: "#fff" }]}>
              Teilen
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: "#60a5fa", // blue-400
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalImage: {
    width: "100%",
    height: 280,
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: "#e0e7ef",
  },
  modalCloseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9,
    marginBottom: 10,
    shadowColor: "#1e40af",
    shadowOpacity: 0.19,
    shadowRadius: 4,
  },
  modalCloseText: {
    marginLeft: 9,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.1,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  photoButtonText: {
    marginLeft: 9,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.1,
  },
});
