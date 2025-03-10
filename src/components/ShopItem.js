// src/components/ShopItem.js
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "./GradientButton";
import styles from "../styles/ShopStyles";

const ShopItem = ({ item, purchased, onBuy }) => {
  return (
    <View style={styles.itemContainer}>
      <View style={styles.gradientPreviewContainer}>
        <LinearGradient colors={item.colors} style={styles.gradientPreview} />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCost}>Cost: {item.cost} Coins</Text>
      <GradientButton
        title={purchased ? "Purchased" : "Buy"}
        onPress={onBuy}
        style={styles.buyButton}
        textStyle={styles.buyButtonText}
      />
    </View>
  );
};

export default ShopItem;
