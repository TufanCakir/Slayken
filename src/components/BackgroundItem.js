// src/components/BackgroundItem.js
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import styles from "../styles/BackgroundSelectionStyles";

const BackgroundItem = ({ item, onSelect }) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(item)}
      style={styles.itemContainer}
    >
      <LinearGradient colors={item.colors} style={styles.gradientPreview} />
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );
};

export default BackgroundItem;
