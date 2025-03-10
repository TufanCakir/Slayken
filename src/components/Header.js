// src/components/Header.js
import React, { useContext } from "react";
import { View, Text } from "react-native";
import { CoinsContext } from "../context/CoinsContext";
import { CrystalsContext } from "../context/CrystalsContext";
import { useAccount } from "../context/AccountContext";
import styles from "../styles/HeaderStyles";

const Header = () => {
  const { coins } = useContext(CoinsContext);
  const { crystals } = useContext(CrystalsContext);
  const { accountLevel } = useAccount();

  return (
    <View style={[styles.container]}>
      <Text style={styles.levelText}>Level: {accountLevel}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.labelText}>Coins:</Text>
          <Text style={styles.statText}>{coins}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.labelText}>Crystals:</Text>
          <Text style={styles.statText}>{crystals}</Text>
        </View>
      </View>
    </View>
  );
};

export default Header;
