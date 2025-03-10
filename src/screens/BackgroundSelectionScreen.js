// src/screens/BackgroundSelectionScreen.js
import React, { useContext } from "react";
import { View, FlatList } from "react-native";
import { BackgroundContext } from "../context/BackgroundContext";
import { PurchasedBackgroundsContext } from "../context/PurchasedBackgroundsContext";
import backgroundsData from "../data/backgrounds.json";
import BackgroundItem from "../components/BackgroundItem";
import styles from "../styles/BackgroundSelectionStyles";
import Footer from "../components/Footer";

export default function BackgroundSelectionScreen() {
  const { setBackgroundColors } = useContext(BackgroundContext);
  const { purchasedBackgrounds } = useContext(PurchasedBackgroundsContext);

  // Filtere Hintergründe, die gekauft wurden oder der Default-Hintergrund ist
  const filteredBackgrounds = backgroundsData.filter(
    (item) => item.id === "default" || purchasedBackgrounds.includes(item.id)
  );

  const handleSelectBackground = (item) => {
    setBackgroundColors(item.colors);
    alert(`Background set to ${item.name}`);
  };

  const renderItem = ({ item }) => (
    <BackgroundItem item={item} onSelect={handleSelectBackground} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredBackgrounds}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <Footer />
    </View>
  );
}
