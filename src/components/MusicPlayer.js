import React from "react";
import { Text, Pressable } from "react-native";
import useSettingsLogic from "../logic/useSettingsLogic";
import styles from "../styles/MusicPlayerStyles";
import { LinearGradient } from "expo-linear-gradient";

const MusicPlayer = () => {
  const { currentTrack, isPlaying, play, pause, nextTrack, previousTrack } =
    useSettingsLogic();

  // Beispiel-Gradient-Farben für die Buttons (kannst du anpassen)
  const buttonGradientColors = ["black", "blue", "black"];

  return (
    <LinearGradient
      colors={["black", "blue", "black"]}
      style={styles.container}
    >
      <Text style={styles.trackText}>
        Aktueller Track: {currentTrack ? currentTrack.title : "Lade..."}
      </Text>

      <Pressable onPress={play} disabled={isPlaying}>
        <LinearGradient colors={buttonGradientColors} style={styles.button}>
          <Text style={styles.buttonText}>Play</Text>
        </LinearGradient>
      </Pressable>

      <Pressable onPress={pause} disabled={!isPlaying}>
        <LinearGradient colors={buttonGradientColors} style={styles.button}>
          <Text style={styles.buttonText}>Pause</Text>
        </LinearGradient>
      </Pressable>

      <Pressable onPress={previousTrack}>
        <LinearGradient colors={buttonGradientColors} style={styles.button}>
          <Text style={styles.buttonText}>Previous</Text>
        </LinearGradient>
      </Pressable>

      <Pressable onPress={nextTrack}>
        <LinearGradient colors={buttonGradientColors} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
};

export default MusicPlayer;
