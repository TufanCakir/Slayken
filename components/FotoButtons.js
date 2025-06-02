// Datei: components/FotoButtons.js
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FotoButtons({
  onPress,
  buttonColor = "#007AFF", // Fallback, falls keine Props übergeben werden
  textColor = "#fff", // Fallback für Text/Icon
}) {
  return (
    <View style={styles.photoButtonsRow}>
      <TouchableOpacity
        style={[styles.photoButton, { backgroundColor: buttonColor }]}
        onPress={onPress}
      >
        <Ionicons name="camera" size={24} color={textColor} />
        <Text style={[styles.photoButtonText, { color: textColor }]}>
          Screenshot
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  photoButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginBottom: 16,
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
