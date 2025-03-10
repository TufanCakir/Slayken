import React, { useState, useContext } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSummonLogic } from "../hooks/useSummonLogic";
import styles from "../styles/SummonStyles";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { LinearGradient } from "expo-linear-gradient";
import { BackgroundContext } from "../context/BackgroundContext"; // Importiere deinen Context

export default function SummonScreen() {
  const navigation = useNavigation();
  const { crystals, loading, handleSingleSummon, handleMultiSummon } =
    useSummonLogic();
  const [bgLoading] = useState(false);

  // Hole die Hintergrundfarben aus dem BackgroundContext
  const { backgroundColors } = useContext(BackgroundContext);

  // Fallback, falls noch keine Farben gesetzt sind
  const gradientColors = backgroundColors || ["black", "blue", "black"];

  const onSingleSummon = async () => {
    const success = await handleSingleSummon();
    if (success) {
      navigation.push("SummonResultScreen");
    }
  };

  const onMultiSummon = async () => {
    const success = await handleMultiSummon();
    if (success) {
      navigation.push("SummonResultScreen");
    }
  };

  if (loading) {
    return (
      <View style={styles.background}>
        <View style={[styles.loadingContainer, styles.center]}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={[styles.crystalsText, { textAlign: "center" }]}>
            Lade...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.background}>
      {bgLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      )}
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Summon</Text>

        <Pressable onPress={onSingleSummon}>
          <LinearGradient
            colors={gradientColors}
            style={[styles.button, styles.singleSummonButton]}
          >
            <Text style={styles.buttonText}>Single Summon (5 Crystals)</Text>
          </LinearGradient>
        </Pressable>

        <Pressable onPress={onMultiSummon}>
          <LinearGradient
            colors={gradientColors}
            style={[styles.button, styles.multiSummonButton]}
          >
            <Text style={styles.buttonText}>Multi Summon (50 Crystals)</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <Footer />
    </View>
  );
}
