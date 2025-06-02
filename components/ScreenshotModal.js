// Datei: components/ScreenshotModal.js
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
      visible={screenshotUri !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.accentColor,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <Text style={[styles.modalHeader, { color: theme.textColor }]}>
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
            style={[
              styles.modalCloseButton,
              { backgroundColor: theme.accentColor },
            ]}
            onPress={onClose}
          >
            <Ionicons name="trash" size={24} color={theme.textColor} />
            <Text style={[styles.modalCloseText, { color: theme.textColor }]}>
              Schließen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.photoButton, { backgroundColor: theme.accentColor }]}
            onPress={shareScreenshot}
          >
            <Ionicons name="share-social" size={24} color={theme.textColor} />
            <Text style={[styles.photoButtonText, { color: theme.textColor }]}>
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    // Schatten für iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Elevation für Android
    elevation: 6,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalCloseButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalCloseText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  photoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});
