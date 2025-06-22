import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function FotoButtons({
  onPress,
  buttonColor = "#2563eb", // Modernes, kräftiges Blau (blue-600)
  textColor = "#fff",
}) {
  return (
    <View style={styles.photoButtonsRow}>
      <BlurView intensity={40} tint="light" style={styles.blur}>
        <TouchableOpacity
          style={[
            styles.photoButton,
            { backgroundColor: "rgba(37,99,235,0.88)", shadowColor: "#60a5fa" },
          ]}
          onPress={onPress}
        >
          <Ionicons name="camera" size={24} color={textColor} />
          <Text style={[styles.photoButtonText, { color: textColor }]}>
            Screenshot
          </Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  photoButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  blur: {
    borderRadius: 14,
    overflow: "hidden",
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 8,
  },
  photoButtonText: {
    marginLeft: 9,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.1,
  },
});
