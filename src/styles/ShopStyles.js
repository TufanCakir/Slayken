// src/styles/ShopStyles.js
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  coinsText: {
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
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
  gradientPreviewContainer: {
    marginBottom: 8,
  },
  gradientPreview: {
    width: 100,
    height: 50,
    borderRadius: 10,
  },
  itemName: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 4,
  },
  itemCost: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  buyButton: {
    width: "50%",
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
