import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { resetToHome } from "../utils/navigationUtils";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { getItemImageUrl } from "../utils/item/itemUtils";
import { LinearGradient } from "expo-linear-gradient";
import skinData from "../data/skinData.json";

// Responsive max width for reward areas
const MAX_CONTENT_WIDTH = 410;

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

  const gradientColors = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
  ];

  // Helpers
  const getCharacterImage = (char) => char && imageMap[`class_${char.id}`];
  const unlockedSkin = skinId && skinData.find((skin) => skin.id === skinId);

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Background */}
      {theme.bgImage && (
        <ExpoImage
          source={theme.bgImage}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={600}
        />
      )}
      <View style={styles.bgOverlay} />

      {/* Title */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.titleGradient}
      >
        <Text style={styles.title}>Sieg!</Text>
      </LinearGradient>

      <View style={styles.contentArea}>
        {/* Neue Charaktere und Skins prominent */}
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

        {/* Charakter Info */}
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

        {/* Rewards */}
        <View style={styles.rewards}>
          <RewardRow
            icon={getItemImageUrl("coin1")}
            label={`+${coinReward} Coins`}
            theme={theme}
          />
          <RewardRow
            icon={getItemImageUrl("crystal1")}
            label={`+${crystalReward} Crystals`}
            theme={theme}
          />
          {isEvent && (
            <Text style={styles.eventLabel}>Event abgeschlossen!</Text>
          )}
        </View>
      </View>

      {/* Zurück-Button */}
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

// ---------- RewardBox/RewardRow ----------
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
        marginVertical: 5,
        gap: 8,
      }}
    >
      <ExpoImage
        source={{ uri: icon }}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: theme.accentColor,
          borderWidth: 1.5,
          borderColor: theme.borderGlowColor,
        }}
        contentFit="contain"
      />
      <Text
        style={{
          fontSize: 18,
          color: theme.textColor,
          fontWeight: "bold",
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

// ---------- Styles ----------
function rewardBoxStyles(theme) {
  return StyleSheet.create({
    rewardBox: {
      borderRadius: 18,
      padding: 19,
      marginBottom: 26,
      alignItems: "center",
      minWidth: 220,
      width: "100%",
      maxWidth: 340,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 7,
      overflow: "hidden",
      backgroundColor: theme.accentColor + "c6",
    },
    rewardTitle: {
      fontSize: 18,
      marginBottom: 8,
      textAlign: "center",
      color: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.23,
      textShadowColor: theme.glowColor,
      textShadowRadius: 8,
    },
    rewardLabel: {
      fontSize: 17,
      marginBottom: 4,
      textAlign: "center",
      color: theme.textColor,
      textShadowColor: theme.glowColor,
      textShadowRadius: 4,
    },
    skinBox: {
      borderRadius: 18,
      padding: 18,
      marginBottom: 22,
      alignItems: "center",
      minWidth: 210,
      width: "100%",
      maxWidth: 310,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.12,
      shadowRadius: 11,
      elevation: 4,
      overflow: "hidden",
      backgroundColor: theme.accentColor + "ca",
    },
    skinTitle: {
      fontSize: 18,
      marginBottom: 7,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 0.23,
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
    },
    skinImage: {
      width: 68,
      height: 68,
      borderRadius: 14,
      marginBottom: 9,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.3,
      borderColor: theme.borderGlowColor,
    },
    skinLabel: {
      fontSize: 16,
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
      borderRadius: 18,
      marginBottom: 11,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.6,
      borderColor: theme.borderGlowColor,
    },
  });
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingTop: Platform.select({ ios: 52, android: 36, default: 44 }),
      paddingHorizontal: 18,
      backgroundColor: theme.accentColor,
      position: "relative",
      overflow: "hidden",
    },
    contentArea: {
      width: "100%",
      maxWidth: MAX_CONTENT_WIDTH,
      alignItems: "center",
      marginTop: 22,
      marginBottom: 26,
      flex: 1,
      justifyContent: "center",
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
      paddingVertical: 10,
      paddingHorizontal: 52,
      alignItems: "center",
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 22,
      shadowOpacity: 0.45,
      shadowOffset: { width: 0, height: 3 },
      elevation: 6,
      overflow: "hidden",
      top: 200,
    },
    title: {
      fontSize: 36,
      letterSpacing: 0.75,
      color: theme.textColor,
      fontWeight: "bold",
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 16,
      textShadowOffset: { width: 0, height: 4 },
      textTransform: "uppercase",
      zIndex: 1,
    },
    characterBox: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 17,
      padding: 14,
      marginBottom: 27,
      backgroundColor: theme.accentColor + "f4",
      width: "100%",
      maxWidth: 350,
      shadowColor: theme.glowColor,
      shadowOpacity: 0.09,
      shadowRadius: 9,
      elevation: 4,
    },
    avatar: {
      width: 92,
      height: 92,
      borderRadius: 17,
      marginBottom: 10,
      marginRight: 12,
      backgroundColor: theme.shadowColor,
      borderWidth: 1.4,
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
      fontSize: 14,
      color: theme.borderGlowColor,
      marginBottom: 2,
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
      marginBottom: 32,
      alignItems: "center",
      width: "100%",
      maxWidth: 350,
    },
    eventLabel: {
      marginTop: 9,
      fontSize: 16,
      color: theme.borderGlowColor,
      fontWeight: "bold",
      letterSpacing: 0.13,
      textShadowColor: theme.glowColor,
      textShadowRadius: 6,
    },
    buttonOuter: {
      borderRadius: 18,
      overflow: "hidden",
      marginTop: 18,
      minWidth: 200,
      alignSelf: "center",
      shadowColor: theme.glowColor,
      shadowRadius: 13,
      shadowOpacity: 0.43,
      elevation: 7,
      bottom: 200,
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 40,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      overflow: "hidden",
    },
    buttonText: {
      fontSize: 18,
      letterSpacing: 0.5,
      color: theme.textColor,
      fontWeight: "bold",
      textAlign: "center",
      textShadowColor: theme.glowColor,
      textShadowRadius: 7,
      zIndex: 1,
    },
  });
}
