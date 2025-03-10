// src/components/EventStartModal.js
import React from "react";
import { View, Text, Pressable, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/EventStyles";

const EventStartModal = ({ onStartEvent }) => {
  const navigation = useNavigation();
  return (
    <View style={[styles.container, styles.center]}>
      <Pressable onPress={onStartEvent}>
        <View style={styles.EventStartButton}>
          <Text style={[styles.EventStartButtonText, { color: "white" }]}>
            Start Event
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

export default React.memo(EventStartModal);
