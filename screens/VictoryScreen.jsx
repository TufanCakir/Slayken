import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { resetToHome } from "../utils/navigationUtils";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import skinData from "../data/skinData.json"; // <--- Importiere deine Skin-Daten!

export default function VictoryScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  const {
    coinReward = 0,
    crystalReward = 0,
    character = null,
    isEvent = false,
    newCharacter = null,
    skinId = null, // <--- neu!
  } = route.params || {};

  // Hole das Skin-Objekt aus skinData (wenn skinId da ist)
  const unlockedSkin = skinId
    ? skinData.find((skin) => skin.id === skinId)
    : null;

  const styles = createStyles(theme);

  // Bildquellen vorbereiten
  const characterImage = character && imageMap[`class_${character.id}`];
  const newCharImage = newCharacter && imageMap[`class_${newCharacter.id}`];

  return (
    <View style={styles.container}>
      {theme.bgImage && (
        <ExpoImage
          source={theme.bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={600}
        />
      )}
      <View style={styles.bgOverlay} />

      <Text style={styles.title}>Sieg!</Text>

      {newCharacter && (
        <View style={styles.rewardBox}>
          <Text style={styles.rewardTitle}>🎉 Neuer Held freigeschaltet!</Text>
          {newCharImage && (
            <ExpoImage
              source={newCharImage}
              style={styles.avatar}
              contentFit="contain"
            />
          )}
          <Text style={styles.rewardLabel}>{newCharacter.label}</Text>
        </View>
      )}

      {character && (
        <View style={styles.characterBox}>
          {characterImage && (
            <ExpoImage
              source={characterImage}
              style={styles.avatar}
              contentFit="contain"
            />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.charLevel}>Level {character.level}</Text>
            <Text style={styles.charXp}>
              XP: {character.exp} / {character.expToNextLevel}
            </Text>
          </View>
        </View>
      )}

      {unlockedSkin && (
        <View style={styles.skinBox}>
          <Text style={styles.skinTitle}>✨ Skin freigeschaltet!</Text>
          <ExpoImage
            source={unlockedSkin.image}
            style={styles.skinImage}
            contentFit="contain"
          />
          <Text style={styles.skinLabel}>{unlockedSkin.label}</Text>
        </View>
      )}

      <View style={styles.rewards}>
        <RewardRow
          icon={getItemImageUrl("coin")}
          label={`+${coinReward} Coins`}
          theme={theme}
        />
        <RewardRow
          icon={getItemImageUrl("crystal")}
          label={`+${crystalReward} Crystals`}
          theme={theme}
        />
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

function RewardRow({ icon, label, theme }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
        gap: 6,
      }}
    >
      <ExpoImage
        source={{ uri: icon }}
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          backgroundColor: theme.accentColor,
        }}
        contentFit="contain"
      />
      <Text style={{ fontSize: 17, color: theme.textColor }}>{label}</Text>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 22,
      position: "relative",
      overflow: "hidden",
    },
    bgOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.glowColor,
      zIndex: 0,
    },
    title: {
      fontSize: 32,
      marginBottom: 32,
      letterSpacing: 0.5,
      color: theme.textColor,
      zIndex: 2,
      fontWeight: "bold",
    },
    rewardBox: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      zIndex: 2,
      minWidth: 220,
    },
    rewardTitle: {
      fontSize: 17,
      marginBottom: 6,
      textAlign: "center",
      color: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.2,
    },
    rewardLabel: {
      fontSize: 16,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
    },
    characterBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      padding: 14,
      marginBottom: 26,
      backgroundColor: theme.accentColor,
      zIndex: 2,
      width: "100%",
      maxWidth: 350,
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
    },
    charName: {
      fontSize: 17,
      marginBottom: 3,
      color: theme.textColor,
      fontWeight: "bold",
    },
    charLevel: {
      fontSize: 13,
      color: theme.borderGlowColor,
      marginBottom: 1,
    },
    charXp: {
      fontSize: 13,
      color: theme.textColor,
      opacity: 0.8,
      marginBottom: 1,
    },
    rewards: {
      marginBottom: 38,
      alignItems: "center",
      zIndex: 2,
      width: "100%",
      maxWidth: 350,
    },
    eventLabel: {
      marginTop: 8,
      fontSize: 15,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.1,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 12,
      marginTop: 10,
      backgroundColor: theme.borderGlowColor,
      zIndex: 2,
      minWidth: 200,
      alignItems: "center",
    },
    buttonText: {
      fontSize: 17,
      letterSpacing: 0.4,
      color: theme.accentColor,
      fontWeight: "bold",
      textAlign: "center",
    },
    skinBox: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
      alignItems: "center",
      backgroundColor: theme.accentColor,
      zIndex: 2,
      minWidth: 220,
      maxWidth: 330,
    },
    skinTitle: {
      fontSize: 17,
      marginBottom: 6,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 0.2,
    },
    skinImage: {
      width: 66,
      height: 66,
      borderRadius: 14,
      marginBottom: 7,
      backgroundColor: theme.shadowColor,
    },
    skinLabel: {
      fontSize: 15,
      color: theme.textColor,
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 1,
    },
  });
}
