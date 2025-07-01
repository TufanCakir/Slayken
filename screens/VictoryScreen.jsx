import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { resetToHome } from "../utils/navigationUtils";
import { useThemeContext } from "../context/ThemeContext";
import { getItemImageUrl } from "../utils/item/itemUtils";

export default function VictoryScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useThemeContext();

  const {
    coinReward = 0,
    crystalReward = 0,
    character = null,
    isEvent = false,
    newEquipment = null,
    newCharacter = null,
  } = route.params || {};

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Dynamisches Hintergrundbild */}
      {theme.bgImage && (
        <ExpoImage
          source={theme.bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={600}
        />
      )}
      {/* Semi-transparenter Overlay */}
      <View style={styles.bgOverlay} />

      <Text style={styles.title}>Sieg!</Text>

      {/* Neue Ausrüstung */}
      {newEquipment && (
        <View style={styles.rewardBox}>
          <Text style={styles.equipTitle}>Neue Ausrüstung freigeschaltet!</Text>
          <Text style={styles.equipLabel}>{newEquipment.label}</Text>
          <Text style={styles.equipDesc}>{newEquipment.description}</Text>
        </View>
      )}

      {/* Neuer Charakter */}
      {newCharacter && (
        <View style={styles.rewardBox}>
          <Text style={styles.charTitle}>🎉 Neuer Held freigeschaltet!</Text>
          <ExpoImage
            source={{ uri: newCharacter.classUrl }}
            style={styles.avatar}
            contentFit="contain"
          />
          <Text style={styles.equipLabel}>{newCharacter.label}</Text>
        </View>
      )}

      {/* Charakter-Infos */}
      {character && (
        <View style={styles.characterBox}>
          <ExpoImage
            source={{ uri: character.classUrl }}
            style={styles.avatar}
            contentFit="contain"
          />
          <View>
            <Text style={styles.name}>{character.name}</Text>
            <Text style={styles.level}>Level {character.level}</Text>
            <Text style={styles.xp}>
              XP: {character.exp} / {character.expToNextLevel}
            </Text>
          </View>
        </View>
      )}

      {/* Rewards */}
      <View style={styles.rewards}>
        <View style={styles.rewardRow}>
          <ExpoImage
            source={{ uri: getItemImageUrl("coin") }}
            style={styles.rewardIcon}
            contentFit="contain"
          />
          <Text style={styles.rewardText}>+{coinReward} Coins</Text>
        </View>
        <View style={styles.rewardRow}>
          <ExpoImage
            source={{ uri: getItemImageUrl("crystal") }}
            style={styles.rewardIcon}
            contentFit="contain"
          />
          <Text style={styles.rewardText}>+{crystalReward} Crystals</Text>
        </View>
        {isEvent && <Text style={styles.eventLabel}>Event abgeschlossen!</Text>}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => resetToHome(navigation)}
      >
        <Text style={styles.buttonText}>Zurück zum Hauptmenü</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      position: "relative",
      overflow: "hidden",
    },
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    title: {
      fontSize: 30,
      marginBottom: 34,
      letterSpacing: 0.5,
      color: theme.textColor,
      zIndex: 2,
    },
    rewardBox: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      zIndex: 2,
    },
    equipTitle: {
      fontSize: 16,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
    },
    charTitle: {
      fontSize: 16,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
    },
    equipLabel: {
      fontSize: 17,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
    },
    equipDesc: {
      fontSize: 15,
      textAlign: "center",
      marginBottom: 6,
      color: theme.textColor,
    },
    characterBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
      backgroundColor: theme.accentColor,
      zIndex: 2,
    },
    avatar: {
      width: 150,
      height: 150,
      marginRight: 14,
      marginBottom: 6,
    },
    name: {
      fontSize: 18,
      marginBottom: 2,
      color: theme.textColor,
    },
    level: {
      fontSize: 14,
      marginTop: 3,
      color: theme.textColor,
    },
    xp: {
      fontSize: 13,
      marginTop: 3,
      color: theme.textColor,
    },
    rewards: {
      marginBottom: 36,
      alignItems: "center",
      zIndex: 2,
    },
    rewardRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 4,
      marginBottom: 2,
      gap: 5,
    },
    rewardIcon: {
      width: 30,
      height: 30,
      marginBottom: 8,
      marginRight: 8,
      borderRadius: 8,
      backgroundColor: theme.accentColor,
    },
    rewardText: {
      fontSize: 18,
      textAlign: "center",
      color: theme.textColor,
    },
    eventLabel: {
      marginTop: 8,
      fontSize: 15,
      color: theme.textColor,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      marginTop: 10,
      backgroundColor: theme.accentColor,
      zIndex: 2,
    },
    buttonText: {
      fontSize: 17,
      letterSpacing: 0.4,
      textAlign: "center",
      color: theme.textColor,
    },
  });
}
