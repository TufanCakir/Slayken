// src/styles/BackgroundSelectionStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  gradientPreview: {
    width: 100,
    height: 50,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 20,
    color: "#fff",
  },
});
