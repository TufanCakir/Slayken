// src/styles/FooterStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  button: {
    // Hier können weitere Style-Attribute ergänzt werden, falls benötigt
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
