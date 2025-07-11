import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { resetToHome } from "../utils/navigationUtils";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { LinearGradient } from "expo-linear-gradient";
import skinData from "../data/skinData.json";

export default function VictoryScreen({ route }) {
  const navigation = useNavigation();
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();

  const {
    coinReward = 0,
    crystalReward = 0,
    character,
    isEvent,
    newCharacter,
    skinId,
  } = route.params || {};

  // Gradient-Farben zentral
  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  // Bildquellen
  const getCharacterImage = (char) => char && imageMap[`class_${char.id}`];
  const unlockedSkin = skinId && skinData.find((skin) => skin.id === skinId);

  const styles = createStyles(theme);

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

      {/* SIEG mit Gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.titleGradient}
      >
        <Text style={styles.title}>Sieg!</Text>
      </LinearGradient>

      {newCharacter && (
        <RewardBox
          label="🎉 Neuer Held freigeschaltet!"
          image={getCharacterImage(newCharacter)}
          text={newCharacter.label}
          theme={theme}
          type="character"
          gradientColors={gradientColors}
        />
      )}

      {character && (
        <View style={styles.characterBox}>
          {getCharacterImage(character) && (
            <ExpoImage
              source={getCharacterImage(character)}
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
        <RewardBox
          label="✨ Skin freigeschaltet!"
          image={unlockedSkin.image}
          text={unlockedSkin.label}
          theme={theme}
          type="skin"
          gradientColors={gradientColors}
        />
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

      {/* Action-Button mit Gradient */}
      <TouchableOpacity
        style={styles.buttonOuter}
        onPress={() => resetToHome(navigation)}
        activeOpacity={0.89}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.12, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Zurück zum Hauptmenü</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

function RewardBox({ label, image, text, theme, type, gradientColors }) {
  const styles = rewardBoxStyles(theme);
  const isSkin = type === "skin";
  const boxStyle = isSkin ? styles.skinBox : styles.rewardBox;
  const imgStyle = isSkin ? styles.skinImage : styles.avatar;
  const labelStyle = isSkin ? styles.skinTitle : styles.rewardTitle;
  const textStyle = isSkin ? styles.skinLabel : styles.rewardLabel;
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={boxStyle}
    >
      <Text style={labelStyle}>{label}</Text>
      {image && (
        <ExpoImage source={image} style={imgStyle} contentFit="contain" />
      )}
      <Text style={textStyle}>{text}</Text>
    </LinearGradient>
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
          borderWidth: 1.5,
          borderColor: theme.borderGlowColor,
        }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 17,
          color: theme.textColor,
          textShadowColor: theme.glowColor,
          textShadowRadius: 7,
          textShadowOffset: { width: 0, height: 2 },
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function rewardBoxStyles(theme) {
  return StyleSheet.create({
    rewardBox: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      alignItems: "center",
      zIndex: 2,
      minWidth: 220,
      width: "90%",
      maxWidth: 360,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.13,
      shadowRadius: 12,
      elevation: 5,
      overflow: "hidden",
    },
    rewardTitle: {
      fontSize: 17,
      marginBottom: 6,
      textAlign: "center",
      color: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    rewardLabel: {
      fontSize: 16,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
    skinBox: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 18,
      alignItems: "center",
      zIndex: 2,
      minWidth: 220,
      maxWidth: 330,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.13,
      shadowRadius: 10,
      elevation: 4,
      overflow: "hidden",
    },
    skinTitle: {
      fontSize: 17,
      marginBottom: 6,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 0.2,
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
    skinImage: {
      width: 66,
      height: 66,
      borderRadius: 14,
      marginBottom: 7,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.2,
      borderColor: theme.borderGlowColor,
    },
    skinLabel: {
      fontSize: 15,
      color: theme.textColor,
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 1,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor,
    },
  });
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
      opacity: 0.15,
    },
    titleGradient: {
      marginBottom: 28,
      borderRadius: 18,
      paddingVertical: 8,
      paddingHorizontal: 45,
      alignItems: "center",
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 22,
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
      overflow: "hidden",
    },
    title: {
      fontSize: 36,
      letterSpacing: 0.7,
      color: theme.textColor,
      fontWeight: "bold",
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 15,
      textShadowOffset: { width: 0, height: 4 },
      textTransform: "uppercase",
      zIndex: 1,
    },
    characterBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      padding: 14,
      marginBottom: 26,
      backgroundColor: theme.accentColor + "f4",
      zIndex: 2,
      width: "100%",
      maxWidth: 350,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.5,
      borderColor: theme.borderGlowColor,
    },
    charName: {
      fontSize: 17,
      marginBottom: 3,
      color: theme.textColor,
      fontWeight: "bold",
      textShadowColor: theme.glowColor,
      textShadowRadius: 5,
    },
    charLevel: {
      fontSize: 13,
      color: theme.borderGlowColor,
      marginBottom: 1,
      textShadowColor: theme.glowColor,
      textShadowRadius: 3,
    },
    charXp: {
      fontSize: 13,
      color: theme.textColor,
      opacity: 0.83,
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
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
    buttonOuter: {
      borderRadius: 16,
      overflow: "hidden",
      marginTop: 18,
      minWidth: 200,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 12,
      shadowOpacity: 0.45,
      elevation: 5,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 36,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      overflow: "hidden",
    },
    buttonText: {
      fontSize: 17,
      letterSpacing: 0.5,
      color: theme.textColor,
      fontWeight: "bold",
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
      zIndex: 1,
    },
  });
}
