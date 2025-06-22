// Datei: styles/ShopScreenStyles.js
import { StyleSheet, Platform } from "react-native";

export default function getShopStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1 },
    balance: {
      fontSize: 18,
      fontWeight: "bold",
      margin: 16,
      textAlign: "center",
      color: theme.textColor,
    },
    pickerContainer: {
      paddingHorizontal: 16,
      marginBottom: 12,
      zIndex: 10,
      position: Platform.OS === "ios" ? "relative" : undefined,
    },
    pickerInput: {
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.shadowColor,
      backgroundColor: theme.accentColor,
      color: theme.textColor,
      fontSize: 16,
    },
    list: { padding: 20, paddingBottom: 40 },
  });
}
