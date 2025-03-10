// src/components/Footer.js
import React, { useContext } from "react";
import { TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { BackgroundContext } from "../context/BackgroundContext";
import styles from "../styles/FooterStyles";

const Footer = () => {
  const navigation = useNavigation();
  const { backgroundColors } = useContext(BackgroundContext);

  return (
    <LinearGradient colors={backgroundColors} style={styles.footer}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TeamScreen")}
      >
        <Text style={styles.buttonText}>Team</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ShopScreen")}
      >
        <Text style={styles.buttonText}>Shop</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SummonScreen")}
      >
        <Text style={styles.buttonText}>Summon</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ExchangeScreen")}
      >
        <Text style={styles.buttonText}>Exchange</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SettingsScreen")}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default Footer;
