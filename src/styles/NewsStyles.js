// src/styles/NewsStyles.js
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  newsContainer: {
    paddingBottom: 20,
  },
  newsCard: {
    backgroundColor: "#222",
    borderRadius: 8,
    marginVertical: 8,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 500,
    resizeMode: "cover",
  },
  newsContent: {
    padding: 12,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    color: "#fff",
    marginBottom: 8,
  },
  newsText: {
    fontSize: 16,
    color: "#fff",
  },
});
