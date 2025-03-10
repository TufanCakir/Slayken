// src/screens/ExchangeScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Footer from "../components/Footer";

export default function ExchangeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Exchange Items Coming Soon</Text>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
