// src/screens/ShopScreen.js
import React, { useContext } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import ShopItem from "../components/ShopItem";
import Footer from "../components/Footer";
import { CoinsContext } from "../context/CoinsContext";
import { PurchasedBackgroundsContext } from "../context/PurchasedBackgroundsContext";
import shopBackgrounds from "../data/shopBackgrounds.json";
import styles from "../styles/ShopStyles";

const ShopScreen = () => {
  const { coins, subtractCoins } = useContext(CoinsContext);
  const { purchasedBackgrounds, setPurchasedBackgrounds } = useContext(
    PurchasedBackgroundsContext
  );

  const purchaseBackground = (item) => {
    if (purchasedBackgrounds.includes(item.id)) {
      alert("You already own this background!");
      return;
    }
    if (coins < item.cost) {
      alert("Not enough coins!");
      return;
    }
    // Coins abziehen und Hintergrund global als gekauft speichern
    subtractCoins(item.cost);
    setPurchasedBackgrounds([...purchasedBackgrounds, item.id]);
    alert(`You purchased ${item.name}!`);
  };

  const renderItem = ({ item }) => (
    <ShopItem
      item={item}
      purchased={purchasedBackgrounds.includes(item.id)}
      onBuy={() => purchaseBackground(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.coinsText}>Your Coins: {coins}</Text>
      <FlatList
        data={shopBackgrounds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <Footer />
    </View>
  );
};

export default ShopScreen;
