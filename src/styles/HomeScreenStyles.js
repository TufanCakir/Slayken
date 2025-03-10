// src/styles/HomeScreenStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    marginBottom: 20,
    width: "100%",
  },
  testModeButton: {
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#444", // Farbe für den Test-Button
  },
  thankYouText: {
    color: "white", // 🔹 Weißer Text für gute Sichtbarkeit
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
});
