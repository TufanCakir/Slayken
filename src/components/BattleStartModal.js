// src/components/BattleStartModal.js
import React from "react";
import { View, Text, Pressable, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/BattleStyles";

const BattleStartModal = ({ onStartBattle }) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, styles.center]}>
      <Pressable onPress={onStartBattle}>
        <View style={styles.battleStartButton}>
          <Text style={[styles.battleStartButtonText, { color: "white" }]}>
            Start Battle
          </Text>
        </View>
      </Pressable>
      <Button
        title="Zum HomeScreen"
        onPress={() => navigation.navigate("HomeScreen")}
        color="white"
      />
    </View>
  );
};

export default React.memo(BattleStartModal);
