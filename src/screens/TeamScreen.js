// src/screens/TeamScreen.js
import React, { useCallback, useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Image, Pressable, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSummonLogic } from "../hooks/useSummon";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "../styles/TeamScreenStyles";
import { LinearGradient } from "expo-linear-gradient";
import { BackgroundContext } from "../context/BackgroundContext";

export default function TeamScreen() {
  const { summonedPlayers } = useSummonLogic();
  const [team, setTeam] = useState([]);

  // Dynamic background from BackgroundContext
  const { backgroundColors } = useContext(BackgroundContext);
  const gradientColors = backgroundColors || ["black", "blue", "black"];

  // Load team from AsyncStorage when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadTeam = async () => {
        try {
          const storedTeam = await AsyncStorage.getItem("myTeam");
          if (storedTeam) {
            setTeam(JSON.parse(storedTeam));
          }
        } catch (error) {
          console.error("Error loading team:", error);
        }
      };
      loadTeam();
    }, [])
  );

  // If the team is empty, automatically load a default character and save it in AsyncStorage
  useEffect(() => {
    async function loadDefaultCharacter() {
      if (team.length === 0) {
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/players.json"
          );
          const players = await response.json();
          if (players && players.length > 0) {
            const defaultTeam = [players[0]];
            setTeam(defaultTeam);
            await AsyncStorage.setItem("myTeam", JSON.stringify(defaultTeam));
          }
        } catch (error) {
          console.error("Error loading default character:", error);
        }
      }
    }
    loadDefaultCharacter();
  }, [team.length]);

  // Toggle player selection in the team
  const togglePlayerInTeam = (player) => {
    const alreadyInTeam = team.some((p) => p.id === player.id);
    if (alreadyInTeam) {
      const updatedTeam = team.filter((p) => p.id !== player.id);
      setTeam(updatedTeam);
      AsyncStorage.setItem("myTeam", JSON.stringify(updatedTeam));
    } else {
      if (team.length >= 5) {
        Alert.alert("Team Limit Reached", "A maximum of 5 players is allowed.");
        return;
      }
      const newTeam = [...team, player];
      setTeam(newTeam);
      AsyncStorage.setItem("myTeam", JSON.stringify(newTeam));
    }
  };

  // Remove duplicate summoned characters
  const uniqueSummonedPlayers = summonedPlayers.filter(
    (player, index, self) => index === self.findIndex((p) => p.id === player.id)
  );

  // Render each player item
  const renderPlayer = ({ item }) => {
    const isSelected = team.some((p) => p.id === item.id);
    return (
      <Pressable onPress={() => togglePlayerInTeam(item)}>
        <View style={isSelected ? styles.selectedButton : styles.button}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.playerImage} />
          )}
          <Text style={styles.playerName}>{item.name}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <Header />
      <View style={styles.innerContainer}>
        <Text style={styles.headerText}>Choose Your Team</Text>
        {/* Hint that a default character is already in the team */}
        <Text style={styles.infoText}>
          Note: A default character is already in your team.
        </Text>
        {uniqueSummonedPlayers.length === 0 ? (
          <Text style={styles.infoText}>
            You haven't summoned any characters yet.
          </Text>
        ) : (
          <FlatList
            data={uniqueSummonedPlayers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlayer}
          />
        )}
        <Text style={styles.teamSizeText}>
          Current team size: {team.length} / 5
        </Text>
      </View>
      <Footer />
    </LinearGradient>
  );
}
